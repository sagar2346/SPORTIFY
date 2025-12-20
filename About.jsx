// about us page code
const About = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-16">
                <h1 className="text-4xl font-bold mb-4">About SportBooking</h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    We are dedicated to making sports accessible to everyone by connecting players with the best venues in town.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
                <div>
                    <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
                    <p className="text-gray-600 text-lg leading-relaxed mb-6">
                        Our mission is to simplify the way people discover and book sports facilities. We believe that engaging in sports should be hassle-free, from finding the right court to securing a slot.
                    </p>
                    <p className="text-gray-600 text-lg leading-relaxed">
                        Whether you are a casual player looking for a weekend game or a professional team needing a regular training ground, SportBooking is here to serve you.
                    </p>
                </div>
                <div className="bg-gray-200 rounded-lg h-80 flex items-center justify-center">
                    <span className="text-gray-500 text-lg">Mission Image Placeholder</span>
                </div>
            </div>

            <div className="bg-primary-50 rounded-2xl p-8 md:p-12 mb-16">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4">Why Choose Us?</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center">
                        <h3 className="text-xl font-bold mb-2">Wide Network</h3>
                        <p className="text-gray-600">Access to hundreds of top-rated sports venues across the country.</p>
                    </div>
                    <div className="text-center">
                        <h3 className="text-xl font-bold mb-2">Instant Booking</h3>
                        <p className="text-gray-600">Real-time availability and instant confirmation for all bookings.</p>
                    </div>
                    <div className="text-center">
                        <h3 className="text-xl font-bold mb-2">Secure Payments</h3>
                        <p className="text-gray-600">Safe and secure payment options for peace of mind.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
