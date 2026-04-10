import React from 'react';
import '../App.css';
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer";
import { Link } from 'react-router-dom';
import { Button } from "@mui/material";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import SecurityIcon from "@mui/icons-material/Security";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";

export default function LandingPage() {
    const features = [
        {
            icon: <VideoCallIcon sx={{ fontSize: 40, color: '#FF9839' }} />,
            title: 'Instant Meeting',
            description: 'Start a video meeting in seconds with just one click'
        },
        {
            icon: <SecurityIcon sx={{ fontSize: 40, color: '#FF9839' }} />,
            title: 'Secure Connection',
            description: 'End-to-end encrypted communication for your privacy'
        },
        {
            icon: <CloudDownloadIcon sx={{ fontSize: 40, color: '#FF9839' }} />,
            title: 'No Downloads',
            description: 'Works directly in your browser, no installation needed'
        }
    ];

    const steps = [
        {
            number: '1',
            title: 'Create or Join',
            description: 'Create a new meeting or join an existing one with a simple code'
        },
        {
            number: '2',
            title: 'Share Your Video',
            description: 'Enable your camera and microphone for seamless communication'
        },
        {
            number: '3',
            title: 'Connect & Collaborate',
            description: 'Start connecting with your team or loved ones instantly'
        }
    ];

    return (
        <div className='landingPageContainer--modern'>
            <Navbar />

            {/* Hero Section */}
            <section className='heroSection'>
                <div className='heroContent'>
                    <h1 className='heroTitle'>
                        Meet. Talk. Done.
                    </h1>
                    <p className='heroSubtitle'>
                        Start video meetings instantly — no setup, no friction.
                    </p>

                    <div className='heroCTA'>
                        <Link to={"/home"} style={{ textDecoration: 'none' }}>
                            <Button
                                variant='contained'
                                size='large'
                                sx={{
                                    backgroundColor: '#FF9839',
                                    color: 'white',
                                    textTransform: 'none',
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    padding: '12px 32px',
                                    borderRadius: '8px',
                                    transition: "all 0.3s ease",
                                    '&:hover': {
                                        backgroundColor: '#e88730',
                                        transform: "translateY(-4px)",
                                        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)"
                                    }
                                }}
                            >
                                Start Meeting
                            </Button>
                        </Link>
                        <Link to={"/home"} style={{ textDecoration: 'none' }}>
                            <Button
                                variant='outlined'
                                size='large'
                                sx={{
                                    color: 'white',
                                    borderColor: 'rgba(255, 255, 255, 0.3)',
                                    textTransform: 'none',
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    padding: '12px 32px',
                                    borderRadius: '8px',
                                    transition: "all 0.3s ease",
                                    '&:hover': {
                                        borderColor: 'rgba(255, 255, 255, 0.6)',
                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                        transform: "translateY(-4px)",
                                        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)"
                                    }
                                }}
                            >
                                Join with Code
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className='featuresSection'>
                <div className='sectionHeader'>
                    <h2>Why Choose Zimpeer?</h2>
                    <p>Everything you need for seamless communication</p>
                </div>

                <div className='featuresGrid'>
                    {features.map((feature, index) => (
                        <div key={index} className='featureCard'>
                            <div className='featureIcon'>
                                {feature.icon}
                            </div>
                            <h3>{feature.title}</h3>
                            <p>{feature.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* How It Works Section */}
            <section className='howItWorksSection'>
                <div className='sectionHeader'>
                    <h2>How It Works</h2>
                    <p>Three simple steps to connect with anyone</p>
                </div>

                <div className='stepsContainer'>
                    {steps.map((step, index) => (
                        <div key={index} className='stepCard'>
                            <div className='stepNumber'>{step.number}</div>
                            <h3>{step.title}</h3>
                            <p>{step.description}</p>
                            {/* {index < steps.length - 1 && <div className='stepDivider'></div>} */}
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className='ctaSection'>
                <div className='ctaBox'>
                    <h2>Start your meeting in seconds</h2>
                    <p>Create a meeting and share the link — it’s that simple.</p>
                    <Link to={"/home"} style={{ textDecoration: 'none' }}>
                        <Button
                            variant='contained'
                            size='large'
                            sx={{
                                backgroundColor: '#FF9839',
                                color: 'white',
                                textTransform: 'none',
                                fontSize: '1.1rem',
                                fontWeight: 600,
                                padding: '14px 40px',
                                borderRadius: '8px',
                                '&:hover': {
                                    backgroundColor: '#e88730'
                                }
                            }}
                        >
                            Start Meeting
                        </Button>
                    </Link>
                </div>
            </section>
            <Footer />
        </div>
    );
};
