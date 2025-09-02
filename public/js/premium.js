document.addEventListener("DOMContentLoaded", () => {
    const payButton = document.getElementById('pay-button');

    // Only run this script if the pay button exists on the page
    if (payButton) {
        payButton.addEventListener('click', async function (e) {
            e.preventDefault();
            payButton.disabled = true; // Disable button to prevent multiple clicks
            payButton.textContent = 'Processing...';

            try {
                // 1. Create the Order by calling your backend
                const response = await fetch('/create-order', { method: 'POST' });
                if (!response.ok) throw new Error('Failed to create order');
                const order = await response.json();

                // 2. Set up Razorpay Checkout options
                const options = {
                    key: window.RAZORPAY_KEY_ID, // Pass key from server-side
                    amount: order.amount,
                    currency: order.currency,
                    name: "Findify",
                    description: "Premium Plan",
                    order_id: order.id,
                    handler: async function (response) {
                        // 3. This function runs after payment is successful
                        //    Send payment details to your server for verification
                        const verificationResponse = await fetch('/verify-payment', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                order_id: response.razorpay_order_id,
                                payment_id: response.razorpay_payment_id,
                                signature: response.razorpay_signature
                            })
                        });

                        const result = await verificationResponse.json();
                        if (result.status === 'success') {
                            // Redirect to dashboard where a flash message will be shown
                            window.location.href = '/dashboard';
                        } else {
                            alert("Payment verification failed. Please contact support.");
                            payButton.disabled = false;
                            payButton.textContent = 'Upgrade Now';
                        }
                    },
                    prefill: {
                        // Ideally, get this from the logged-in user's data
                        name: window.USER_INFO.username,
                        email: window.USER_INFO.email,
                        role: window.USER_INFO.role,
                    },
                    theme: {
                        color: "#4f46e5" // Your site's primary color
                    }
                };
                
                // 4. Create a new Razorpay instance and open the checkout
                const rzp = new Razorpay(options);

                rzp.on('payment.failed', function (response){
                        alert("Payment failed. " + response.error.description);
                        payButton.disabled = false;
                        payButton.textContent = 'Upgrade Now';
                });

                rzp.open();

            } catch (error) {
                console.error("Payment failed:", error);
                alert("Please Login to continue.If logged in please contact support.");
                payButton.disabled = false;
                payButton.textContent = 'Upgrade Now';
            }
        });
    }
});
