import { useState } from 'react';
import { FiPlus, FiMinus } from 'react-icons/fi';

const FAQ = () => {
    const faqs = [
        {
            question: "How do I book a venue?",
            answer: "Search for a venue, select your preferred date and time, and proceed to payment. You will receive a confirmation immediately."
        },
        {
            question: "Can I cancel my booking?",
            answer: "Yes, you can cancel your booking from your dashboard. Cancellations made 24 hours before the slot are fully refundable."
        },
        {
            question: "How do I list my venue?",
            answer: "Sign up as a Venue Owner, complete your profile, and click 'Add Venue' in your dashboard to list your facility."
        },
        {
            question: "Is payment secure?",
            answer: "Yes, we use industry-standard encryption to ensure all payments are secure."
        }
    ];

    const [openIndex, setOpenIndex] = useState(null);

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold mb-12 text-center">Frequently Asked Questions</h1>
            <div className="space-y-4">
                {faqs.map((faq, index) => (
                    <div key={index} className="border rounded-lg overflow-hidden">
                        <button
                            className="w-full flex justify-between items-center p-4 bg-white hover:bg-gray-50 text-left focus:outline-none"
                            onClick={() => setOpenIndex(openIndex === index ? null : index)}
                        >
                            <span className="font-medium text-lg text-gray-900">{faq.question}</span>
                            {openIndex === index ? <FiMinus className="flex-shrink-0" /> : <FiPlus className="flex-shrink-0" />}
                        </button>
                        {openIndex === index && (
                            <div className="p-4 bg-gray-50 border-t">
                                <p className="text-gray-600">{faq.answer}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FAQ;
