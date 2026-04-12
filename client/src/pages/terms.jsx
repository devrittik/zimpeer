import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Card from "../components/UI/Card";
import Button from "../components/UI/Button";
import { Helmet } from "react-helmet-async";
import logo from "../logo.svg";
import styles from "../styles/legal.module.css";

export default function Terms() {
    const navigate = useNavigate();

    return (
        <>
            <Helmet>
                <title>Terms & Conditions | Zimpeer</title>
                <meta
                    name="description"
                    content="Read the terms and conditions for using Zimpeer."
                />
                <link rel="canonical" href="https://zimpeer.vercel.app/terms" />
            </Helmet>
        <Box className={styles.page}>
            <Card>
                <div className={styles.cardContent}>
                    <Box sx={{ textAlign: "center", mb: 2 }}>
                        <Box component="img" src={logo} alt="Zimpeer logo" className={styles.logo} />
                        <Typography variant="h5" className={styles.title}>
                            Terms of Service
                        </Typography>
                        <Typography className={styles.muted}>Last updated: {new Date().getFullYear()}</Typography>
                    </Box>

                    <div className={styles.section}>
                        <p style={{ fontStyle: "italic", textDecorationLine: "underline" }}>This is a personal project for educational and demonstration purposes.</p>
                    </div>

                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>By using Zimpeer, you agree to:</h3>
                        <ul className={styles.list}>
                            <li>Use the platform only for lawful purposes</li>
                            <li>Not misuse, abuse, or attempt to break the system</li>
                            <li>Not engage in harassment, spam, or harmful activities</li>
                        </ul>
                    </div>

                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Accounts:</h3>
                        <ul className={styles.list}>
                            <li>You are responsible for maintaining the confidentiality of your account</li>
                            <li>Any activity under your account is your responsibility</li>
                        </ul>
                    </div>

                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Meeting usage:</h3>
                        <ul className={styles.list}>
                            <li>Do not share meeting links publicly in a harmful way</li>
                            <li>Respect other participants</li>
                        </ul>
                    </div>

                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Availability:</h3>
                        <ul className={styles.list}>
                            <li>The service is provided "as is"</li>
                            <li>We do not guarantee uptime, reliability, or bug-free operation</li>
                        </ul>
                    </div>

                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Limitation of liability:</h3>
                        <ul className={styles.list}>
                            <li>We are not responsible for any data loss, misuse, or damages arising from use of the platform</li>
                        </ul>
                    </div>

                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Termination:</h3>
                        <ul className={styles.list}>
                            <li>We may restrict or block access if misuse is detected</li>
                        </ul>
                    </div>

                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Changes:</h3>
                        <ul className={styles.list}>
                            <li>These terms may be updated at any time without notice</li>
                        </ul>
                    </div>

                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Acceptance:</h3>
                        <ul className={styles.list}>
                            <li>By using this platform, you accept these terms</li>
                        </ul>
                    </div>

                    <div className={styles.backWrap}>
                        <Button onClick={() => navigate(-1)}>Back</Button>
                    </div>
                </div>
            </Card>
        </Box>
        </>
    );
}
