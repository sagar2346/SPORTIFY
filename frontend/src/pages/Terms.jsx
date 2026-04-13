const Terms = () => {
    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold mb-8">Terms and Conditions</h1>
            <div className="prose max-w-none">
                <p className="mb-4 text-gray-600">
                    Welcome to Sportify. By accessing this website, we assume you accept these terms and conditions.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">1. Booking Policy</h2>
                <p className="mb-4 text-gray-600">
                    All bookings are subject to availability. Payment must be made in full at the time of booking unless stated otherwise.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">2. Cancellation and Refunds</h2>
                <p className="mb-4 text-gray-600">
                    Cancellations made 24 hours prior to the booking time are eligible for a full refund. Cancellations made within 24 hours may be subject to a fee.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">3. User Conduct</h2>
                <p className="mb-4 text-gray-600">
                    Users are expected to conduct themselves respectfully at all venues. Any damage caused to venue property will be the responsibility of the user.
                </p>
            </div>
        </div>
    );
};

export default Terms;
