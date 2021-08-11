import React from "react";
import './Footer.css'

const Footer = () => {
    return (
        <footer className="footer" >
            <div className="footer-container" >
                <div style={{ justifyContent:"center",textAlign:"center" }}>
                    <h3 style={{fontSize: "25px"}} >RedactTogether &copy; {new Date().getFullYear()}</h3>
                </div>

            </div>
        </footer>
    );
};

export default Footer;
