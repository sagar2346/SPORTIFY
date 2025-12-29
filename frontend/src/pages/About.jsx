import { useState } from 'react';
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter, FaTimes, FaGithub } from 'react-icons/fa';
import aboutMission from '../assets/about-mission.png';
import sagarDahal from '../assets/sagar_dahal.png';
import ankitDhakal from '../assets/ankit_dhakal.png';
import sankalpa from '../assets/sankalpa.jpg';

const teamMembers = [
    {
        name: 'Sagar Dahal',
        role: 'Founder & Lead Developer',
        bio: 'Passionate about sports and technology, leading the vision of Sportify.',
        image: sagarDahal,
        socials: {
            facebook: 'https://www.facebook.com/hdgsis.jsgsh',
            linkedin: 'https://www.linkedin.com/in/sagar-dahal-347a58281/',
            github: 'https://github.com/sagar2346'
        }
    },
    {
        name: 'Ankit Dhakal',
        role: 'Head of Operations',
        bio: 'Ensuring seamless venue partnerships and top-notch customer support.',
        image: ankitDhakal,
        socials: {
            facebook: 'https://facebook.com/ankit.dhakal.12327',
            github: 'https://github.com/AnkitDhakal911'
        }
    },
    {
        name: 'Sankalpa Singh Chouhan',
        role: 'Lead UI/UX Designer',
        bio: 'Creating beautiful and intuitive experiences for all our users.',
        image: sankalpa,
        socials: {
            facebook: 'https://facebook.com/sankalpa.chouhan',
            github: 'https://github.com/snakestein'
        }
    }
];

const About = () => {
    const [selectedMember, setSelectedMember] = useState(null);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-16">
                <h1 className="text-4xl font-bold mb-4">About Sportify</h1>
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
                <div className="rounded-lg h-80 overflow-hidden shadow-lg">
                    <img
                        src={aboutMission}
                        alt="Our Mission"
                        className="w-full h-full object-cover"
                    />
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

            <div className="mb-16">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4">Meet Our Professionals</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Our team of dedicated experts working behind the scenes to provide you the best sports booking experience.
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {teamMembers.map((member, index) => (
                        <div
                            key={index}
                            onClick={() => setSelectedMember(member)}
                            className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-slate-100"
                        >
                            <div className="h-72 overflow-hidden relative">
                                <img src={member.image} alt={member.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-primary-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                    <span className="text-white font-bold bg-primary-600 px-4 py-2 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                        View Socials
                                    </span>
                                </div>
                            </div>
                            <div className="p-6 text-center">
                                <h3 className="text-xl font-bold text-slate-900 mb-1">{member.name}</h3>
                                <p className="text-primary-600 font-medium mb-3">{member.role}</p>
                                <p className="text-gray-500 text-sm">{member.bio}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Social Media Modal */}
            {selectedMember && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        onClick={() => setSelectedMember(null)}
                    ></div>
                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 overflow-hidden animate-in fade-in zoom-in duration-300">
                        <button
                            onClick={() => setSelectedMember(null)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <FaTimes size={24} />
                        </button>

                        <div className="text-center mb-8">
                            <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4 border-4 border-primary-50">
                                <img src={selectedMember.image} alt={selectedMember.name} className="w-full h-full object-cover" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900">{selectedMember.name}</h3>
                            <p className="text-primary-600 font-semibold">{selectedMember.role}</p>
                        </div>

                        <div className="flex justify-center gap-6 mb-4">
                            {selectedMember.socials.linkedin && (
                                <a href={selectedMember.socials.linkedin} target="_blank" rel="noopener noreferrer" className="p-4 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md">
                                    <FaLinkedin size={28} />
                                </a>
                            )}
                            {selectedMember.socials.github && (
                                <a href={selectedMember.socials.github} target="_blank" rel="noopener noreferrer" className="p-4 bg-slate-100 text-slate-900 rounded-2xl hover:bg-slate-900 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md">
                                    <FaGithub size={28} />
                                </a>
                            )}
                            {selectedMember.socials.facebook && (
                                <a href={selectedMember.socials.facebook} target="_blank" rel="noopener noreferrer" className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md">
                                    <FaFacebook size={28} />
                                </a>
                            )}
                            {selectedMember.socials.instagram && (
                                <a href={selectedMember.socials.instagram} target="_blank" rel="noopener noreferrer" className="p-4 bg-pink-50 text-pink-600 rounded-2xl hover:bg-pink-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md">
                                    <FaInstagram size={28} />
                                </a>
                            )}
                            {selectedMember.socials.twitter && (
                                <a href={selectedMember.socials.twitter} target="_blank" rel="noopener noreferrer" className="p-4 bg-sky-50 text-sky-500 rounded-2xl hover:bg-sky-500 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md">
                                    <FaTwitter size={28} />
                                </a>
                            )}
                        </div>

                        <p className="text-center text-slate-500 text-sm mt-6">
                            Follow {selectedMember.name.split(' ')[0]} on social media to stay updated with her latest work and adventures.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default About;
