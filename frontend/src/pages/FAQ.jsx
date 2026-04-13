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
                    <div key={index} className="border rounded-xl overflow-hidden shadow-sm">
                        <button
                            className="w-full flex justify-between items-center p-5 bg-white hover:bg-gray-50 text-left focus:outline-none transition-colors"
                            onClick={() => setOpenIndex(openIndex === index ? null : index)}
                        >
                            <span className="font-bold text-lg text-gray-900">{faq.question}</span>
                            <div className={`p-2 rounded-full ${openIndex === index ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-400'} transition-all`}>
                                {openIndex === index ? <FiMinus className="flex-shrink-0" /> : <FiPlus className="flex-shrink-0" />}
                            </div>
                        </button>
                        {openIndex === index && (
                            <div className="p-5 bg-gray-50 border-t animate-in slide-in-from-top-4 duration-300">
                                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FAQ;
