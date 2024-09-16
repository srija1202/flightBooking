const Amadeus = require('amadeus');
const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_CLIENT_ID,
  clientSecret: process.env.AMADEUS_CLIENT_SECRET,
});

exports.searchFlights = async (req, res) => {
  const { origin, destination, departureDate } = req.query;

  try {
    // Validate required parameters
    if (!origin || !destination || !departureDate) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }

    // Call Amadeus API
    const response = await amadeus.shopping.flightOffersSearch.get({
      originLocationCode: origin,
      destinationLocationCode: destination,
      departureDate: departureDate,
      adults: 4,
      max: 30
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching flights from Amadeus:', error);
    res.status(500).json({ message: 'Error fetching flights from Amadeus', error });
  }
};
