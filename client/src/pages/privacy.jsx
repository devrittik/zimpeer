import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Card from "../components/UI/Card";
import Button from "../components/UI/Button";
import logo from "../logo.svg";
import styles from "../styles/legal.module.css";

export default function Privacy() {
    const navigate = useNavigate();

    return (
        <Box className={styles.page}>
            <Card>
                <div className={styles.cardContent}>
                    <Box sx={{ textAlign: "center", mb: 2 }}>
                        <Box component="img" src={logo} alt="Zimpeer logo" className={styles.logo} />
                        <Typography variant="h5" className={styles.title}>
                            Privacy Policy
                        </Typography>
                        <Typography className={styles.muted}>Last updated: {new Date().getFullYear()}</Typography>
                    </Box>

                    <div className={styles.section}>
                        <p style={{ fontStyle: "italic", textDecorationLine: "underline" }}>This is a personal project created for demonstration and learning purposes.</p>
                    </div>

                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Information we collect:</h3>
                        <ul className={styles.list}>
                            <li>Email address (for authentication)</li>
                            <li>Basic user info (if provided)</li>
                            <li>Meeting-related metadata (room ID, timestamps)</li>
                        </ul>
                    </div>

                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>We do NOT store:</h3>
                        <ul className={styles.list}>
                            <li>Video or audio content of meetings</li>
                            <li>Chat messages (unless explicitly implemented)</li>
                        </ul>
                    </div>

                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>How we use your data:</h3>
                        <ul className={styles.list}>
                            <li>To authenticate users</li>
                            <li>To enable meeting creation and joining</li>
                            <li>To improve the application experience</li>
                        </ul>
                    </div>

                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Real-time communication:</h3>
                        <ul className={styles.list}>
                            <li>Video and audio are transmitted using WebRTC (peer-to-peer)</li>
                            <li>We do not record or store media streams</li>
                        </ul>
                    </div>

                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Third-party services:</h3>
                        <ul className={styles.list}>
                            <li>We may use external services (e.g., email providers) for sending verification emails</li>
                            <li>These services may process your email address for delivery purposes</li>
                        </ul>
                    </div>

                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Data security:</h3>
                        <ul className={styles.list}>
                            <li>We take reasonable measures to protect user data</li>
                            <li>However, this project does not guarantee enterprise-level security</li>
                        </ul>
                    </div>

                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>User responsibility:</h3>
                        <ul className={styles.list}>
                            <li>Do not share sensitive or confidential information during meetings</li>
                            <li>Use the platform responsibly</li>
                        </ul>
                    </div>

                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Changes:</h3>
                        <ul className={styles.list}>
                            <li>This policy may be updated at any time without prior notice</li>
                        </ul>
                    </div>

                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Contact:</h3>
                        <ul className={styles.list}>
                            <li>For any concerns, contact: megakreatryx@gmail.com</li>
                        </ul>
                    </div>

                    <div className={styles.backWrap}>
                        <Button onClick={() => navigate(-1)}>Back</Button>
                    </div>
                </div>
            </Card>
        </Box>
    );
}
