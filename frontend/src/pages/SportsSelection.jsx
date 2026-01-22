import { Link } from 'react-router-dom';
import {
    IoMdFootball,
    IoMdBasketball,
    IoMdTennisball
} from 'react-icons/io';
import {
    MdSportsCricket,
    MdSportsVolleyball,
    MdSportsTennis,
    MdPool
} from 'react-icons/md';
import { BiRun } from 'react-icons/bi'; // Placeholder for Futsal if specific icon not found
import { MdFitnessCenter } from 'react-icons/md';

// Local Assets
import catFootball from '../assets/cat_football.png';
import catTableTennis from '../assets/cat_table_tennis.png';

const sports = [
    {
        id: 'football',
        name: 'Football',
        icon: <IoMdFootball className="w-16 h-16" />,
        color: 'bg-green-500',
        description: 'Book 11-a-side or 7-a-side pitches',
        image: catFootball
    },
    {
        id: 'basketball',
        name: 'Basketball',
        icon: <IoMdBasketball className="w-16 h-16" />,
        color: 'bg-orange-500',
        description: 'Indoor and outdoor courts available',
        image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 'cricket',
        name: 'Cricket',
        icon: <MdSportsCricket className="w-16 h-16" />,
        color: 'bg-red-600',
        description: 'Nets and full grounds for matches',
        image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 'volleyball',
        name: 'Volleyball',
        icon: <MdSportsVolleyball className="w-16 h-16" />,
        color: 'bg-yellow-500',
        description: 'Beach and indoor volleyball courts',
        image: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 'table_tennis',
        name: 'Table Tennis',
        icon: <MdSportsTennis className="w-16 h-16" />,
        color: 'bg-blue-500',
        description: 'Standard ITTF approved tables',
        image: catTableTennis
    },
    {
        id: 'futsal',
        name: 'Futsal',
        icon: <IoMdFootball className="w-16 h-16" />, // Reusing football icon or generic
        color: 'bg-emerald-600',
        description: '5-a-side indoor football courts',
        image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 'swimming',
        name: 'Swimming',
        icon: <MdPool className="w-16 h-16" />,
        color: 'bg-cyan-500',
        description: 'Indoor and outdoor swimming pools',
        image: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 'gym',
        name: 'GYM',
        icon: <MdFitnessCenter className="w-16 h-16" />,
        color: 'bg-slate-700',
        description: 'Professional gym facilities and trainers',
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80'
    }
];

const SportsSelection = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                        Choose Your <span className="text-primary-600">Sport</span>
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
                        Select a sport to find the perfect venue. Professional courts and grounds waiting for you.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {sports.map((sport) => (
                        <Link
                            key={sport.id}
                            to={`/sports/${sport.id}`}
                            className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer transform transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:-translate-y-2"
                        >
                            {/* Background Image with Overlay */}
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                style={{ backgroundImage: `url(${sport.image})` }}
                            >
                                <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors duration-300"></div>
                            </div>

                            {/* Content */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                                <div className={`p-4 rounded-full bg-white/10 backdrop-blur-sm mb-4 transform transition-transform duration-500 group-hover:scale-110 group-hover:bg-white/20 text-white`}>
                                    {sport.icon}
                                </div>

                                <h3 className="text-3xl font-bold text-white mb-2 tracking-wide group-hover:text-primary-400 transition-colors">
                                    {sport.name}
                                </h3>

                                <p className="text-gray-200 text-lg opacity-0 transform translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                                    {sport.description}
                                </p>

                                <div className="mt-6 px-6 py-2 bg-primary-600 text-white font-semibold rounded-full opacity-0 transform translate-y-4 transition-all duration-300 delay-100 group-hover:opacity-100 group-hover:translate-y-0 hover:bg-primary-700">
                                    Book Now
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SportsSelection;
