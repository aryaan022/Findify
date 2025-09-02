document.addEventListener("DOMContentLoaded", () => {
    const payButton = document.getElementById('pay-button');
    console.log("Script loaded. Pay button found:", payButton); // Log 1

    if (payButton) {
        const razorpayKeyId = payButton.dataset.key;
        console.log("Razorpay Key ID found on button:", razorpayKeyId); // Log 2

        payButton.addEventListener('click', async function (e) {
            e.preventDefault();
            console.log("Pay button clicked!"); // Log 3
            payButton.disabled = true;
            payButton.textContent = 'Processing...';

            try {
                const response = await fetch('/create-order', { method: 'POST' });
                if (!response.ok) throw new Error('Failed to create order. You might not be logged in.');

                const { order, userDetails } = await response.json();
                console.log("Server response received:", { order, userDetails }); // Log 4: CRITICAL CHECK

                const options = {
                    key: razorpayKeyId,
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
                
                console.log("Final options sent to Razorpay:", options); // Log 5: CRITICAL CHECK
                const rzp = new Razorpay(options);

                rzp.on('payment.failed', function (response){
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