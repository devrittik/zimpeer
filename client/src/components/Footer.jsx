import React from "react";
import { Box, Typography, Link as MuiLink, IconButton, Divider } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import logo from "../logo.svg";
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import XIcon from '@mui/icons-material/X';
import EmailIcon from '@mui/icons-material/Email';

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer aria-label="Zimpeer footer">
            <Box sx={{
                background: 'rgba(0,0,0,0.32)',
                py: { xs: 4, md: 6 },
                px: { xs: 2, md: 4 },
            }}>
                <Box sx={{ width: '100%', maxWidth: '1400px', mx: 'auto', px: { xs: 2, md: 3 } }}>
                    <Box sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        gap: 2,
                        alignItems: 'flex-start',
                        justifyContent: 'space-between'
                    }}>
                        <Box sx={{ width: { xs: '100%', md: '33.333%' }, pr: { md: 2 }, textAlign: 'left' }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-start' }}>
                                <Box component="img" src={logo} alt="Zimpeer" sx={{ width: { xs: 140, md: 220 }, height: 'auto' }} />
                                <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 320 }}>
                                    Fast, simple video meetings in your browser
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ width: { xs: '100%', md: '33.333%' }, px: { md: 2 }, textAlign: 'left' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Product</Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, alignItems: 'flex-start' }}>
                                <MuiLink component={RouterLink} to="/home" underline="none" sx={{ color: 'text.primary', '&:hover': { color: 'primary.main' } }} aria-label="Create Meeting">
                                    Create Meeting
                                </MuiLink>
                                <MuiLink component={RouterLink} to="/home" underline="none" sx={{ color: 'text.primary', '&:hover': { color: 'primary.main' } }} aria-label="Join Meeting">
                                    Join Meeting
                                </MuiLink>
                            </Box>
                        </Box>

                        <Box sx={{ width: { xs: '100%', md: '33.333%' }, pl: { md: 2 }, textAlign: 'left' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Legal & Contact</Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mb: 1, alignItems: 'flex-start' }}>
                                <MuiLink component={RouterLink} to="/privacy" underline="none" sx={{ color: 'text.primary', '&:hover': { color: 'primary.main' } }} aria-label="Privacy Policy">
                                    Privacy Policy
                                </MuiLink>
                                <MuiLink component={RouterLink} to="/terms" underline="none" sx={{ color: 'text.primary', '&:hover': { color: 'primary.main' } }} aria-label="Terms of Service">
                                    Terms of Service
                                </MuiLink>
                            </Box>

                            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>Contact: <MuiLink href="mailto:rittikchakraborty24@gmail.com" sx={{ color: 'text.primary' }}>rittikchakraborty24@gmail.com</MuiLink></Typography>

                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-start' }}>
                                <IconButton component="a" href="mailto:rittikchakraborty24@gmail.com" target="_blank" rel="noopener" aria-label="Email" sx={{ color: 'text.primary' }}>
                                    <EmailIcon />
                                </IconButton>
                                <IconButton component="a" href="https://github.com/devrittik/" target="_blank" rel="noopener" aria-label="GitHub" sx={{ color: 'text.primary' }}>
                                    <GitHubIcon />
                                </IconButton>
                                <IconButton component="a" href="https://www.linkedin.com/in/rittik-chakraborty/" target="_blank" rel="noopener" aria-label="LinkedIn" sx={{ color: 'text.primary' }}>
                                    <LinkedInIcon />
                                </IconButton>
                                <IconButton component="a" href="https://x.com/hiimrittik" target="_blank" rel="noopener" aria-label="X (Twitter)" sx={{ color: 'text.primary' }}>
                                    <XIcon />
                                </IconButton>
                            </Box>
                        </Box>
                    </Box>

                    <Box sx={{ mt: 4 }}>
                        <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />
                        <Typography variant="caption" component="div" sx={{ textAlign: 'center', mt: 2, color: 'text.secondary' }}>
                            © {year} Zimpeer. All rights reserved.
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </footer>
    );
}
