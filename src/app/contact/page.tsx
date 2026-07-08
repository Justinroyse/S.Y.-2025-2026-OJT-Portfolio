import NavBar from "@/components/ui/NavBar";
import Link from "next/link";
import Footer from "@/components/ui/Footer";


export default function Contact() {
    return (
        <>
        <NavBar />    
        <div className="flex flex-col justify-start items-center text-brown-500 p-5 min-h-screen">
            <h1 className="text-3xl md:text-5xl">Contact Me</h1>
            <p>Email: justinroyselsolomon@gmail.com</p>
            <p>Facebook: <Link href="https://www.facebook.com/JustinRoyse.Solomon">JustinRoyse.Solomon</Link></p>
            <p>LinkedIn: <Link href="https://www.linkedin.com/in/justin-royse-solomon">Justin Royse Solomon</Link></p>
            <p>GitHub: <Link href="https://github.com/Justinroyse">Justinroyse</Link></p>
            <p>Mobile Number: 09082022037</p>
        </div>
        <Footer />
        </>
    );
}
