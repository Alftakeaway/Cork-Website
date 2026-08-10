module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { firstName, lastName, date, time, guests, phone, email, notes } = req.body;

    const formatDate = (dateStr) => {
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
    };

    try {
        // Email a te
        await fetch('https://api.resend.com/emails', {
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
                    <p><strong>Date:</strong> ${formatDate(date)}</p>
                    <p><strong>Time:</strong> ${time}</p>
                    <p><strong>Guests:</strong> ${guests}</p>
                    <p><strong>Phone:</strong> ${phone}</p>
                    <p><strong>Email:</strong> ${email || 'Not provided'}</p>
                    <p><strong>Notes:</strong> ${notes || 'None'}</p>
                `,
            }),
        });

        // Conferma al cliente
        if (email) {
            await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    from: 'onboarding@resend.dev',
                    to: email,
                    subject: `Reservation Request Received — Cork Wine Bar Bistro`,
                    html: `
                        <p>Dear ${firstName},</p>
                        <p>Thank you for your reservation request at Cork Wine Bar Bistro.</p>
                        <p>We have received your booking for <strong>${formatDate(date)}</strong> at <strong>${time}</strong> for <strong>${guests}</strong>.</p>
                        <p>We will confirm your reservation by phone or email shortly.</p>
                        <br>
                        <p>Suffolk House, 54–55 The Green<br>Wooburn Green, HP10 0EU</p>
                        <p>Cork Wine Bar Bistro</p>
                    `,
                }),
            });
        }

        return res.status(200).json({ success: true });

    } catch (err) {
        return res.status(500).json({ error: 'Failed to send' });
    }
}