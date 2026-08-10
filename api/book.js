module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    console.log('Body received:', req.body);
    console.log('API Key exists:', !!process.env.RESEND_API_KEY);
    console.log('Full env:', process.env);

    const { firstName, lastName, date, time, guests, phone, notes } = req.body;

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: 'onboarding@resend.dev',
                to: 'forte.alfredo80@gmail.com',
                subject: `New Booking — ${firstName} ${lastName}`,
                html: `
          <h2>New Reservation Request</h2>
          <p><strong>Name:</strong> ${firstName} ${lastName}</p>
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Time:</strong> ${time}</p>
          <p><strong>Guests:</strong> ${guests}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Notes:</strong> ${notes || 'None'}</p>
        `,
            }),
        });

        if (!response.ok) throw new Error('Resend error');
        return res.status(200).json({ success: true });

    } catch (err) {
        return res.status(500).json({ error: 'Failed to send' });
    }
}