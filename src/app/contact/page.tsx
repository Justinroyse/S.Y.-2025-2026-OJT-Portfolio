import Link from "next/link";

interface ContactProps {
    
}

export default function Contact({}: ContactProps) {
    return (
        <>
        <div className="flex flex-col justify-start items-center text-brown-500 p-5 min-h-screen">
            <h1 className="text-3xl md:text-5xl">Contact Me</h1>
            <p>Email: [EMAIL_ADDRESS]</p>
            <p>Facebook: <Link href="https://www.facebook.com/JustinRoyse.Solomon">JustinRoyse.Solomon</Link></p>
            <p>LinkedIn: <Link href="https://www.linkedin.com/in/justin-royse-solomon">Justin Royse Solomon</Link></p>
            <p>GitHub: <Link href="https://github.com/Justinroyse">Justinroyse</Link></p>
            <p>Mobile Number: 09082022037</p>
        </div>
        </>
    );
}
