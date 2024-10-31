const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const createCheckoutSession = async (customerId, priceId) => {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/subscription/cancel`,
  });
  return session;
};

const createCustomer = async (email, name) => {
  const customer = await stripe.customers.create({
    email,
    name,
  });
  return customer;
};

const handleWebhook = async (event) => {
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      // Handle successful payment
      break;
    case 'customer.subscription.deleted':
      const subscription = event.data.object;
      // Handle subscription cancellation
      break;
    case 'invoice.payment_failed':
      const invoice = event.data.object;
      // Handle failed payment
      break;
  }
};

module.exports = {
  createCheckoutSession,
  createCustomer,
  handleWebhook,
};