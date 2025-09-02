document.addEventListener("DOMContentLoaded", () => {
    const payButton = document.getElementById('pay-button');

    if (payButton) {
        // Read the key directly from the button's data attribute
        const razorpayKeyId = payButton.dataset.key;

        payButton.addEventListener('click', async function (e) {
            e.preventDefault();
            payButton.disabled = true;
            payButton.textContent = 'Processing...';

            try {
                // 1. Create the Order by calling your backend
                const response = await fetch('/create-order', { method: 'POST' });
                if (!response.ok) {
                    throw new Error('Failed to create order. You might not be logged in.');
                }

                // 2. Correctly destructure BOTH order and userDetails from the JSON response
                const { order, userDetails } = await response.json();

                // 3. Set up Razorpay Checkout options
                const options = {
                    key: razorpayKeyId, // Use the key read from the button
                    amount: order.amount,
                    currency: order.currency,
                    name: "Findify",
                    description: "Premium Plan",
                    order_id: order.id,
                    handler: async function (response) {
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
                            // On success, redirect to the dashboard to see the flash message
                            window.location.href = '/dashboard';
                        } else {
                            alert("Payment verification failed. Please contact support.");
                            payButton.disabled = false;
                            payButton.textContent = 'Upgrade Now';
                        }
                    },
                    prefill: {
                        name: userDetails.name,
                        email: userDetails.email,
                        contact: userDetails.contact
                    },
                    theme: {
                        color: "#4f46e5"
                    }
                };

                const rzp = new Razorpay(options);

                rzp.on('payment.failed', function (response) {
                    alert("Payment failed: " + response.error.description);
                    payButton.disabled = false;
                    payButton.textContent = 'Upgrade Now';
                });

                rzp.open();

            } catch (error) {
                console.error("Payment failed:", error);
                alert("Could not start payment. Please ensure you are logged in.");
                payButton.disabled = false;
                payButton.textContent = 'Upgrade Now';
            }
        });
    }
});