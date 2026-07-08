import Link from "next/link";

interface NavBarProps {
    
}

// Simple Navbar with Contact, About, and Requirements Buttons

export default function NavBar({  }: NavBarProps) {
    return (
        <>
        <div className="flex flex-col justify-center md:flex-row gap-5 bg-slate-600 text-white p-5">
            <Link href="/"><h1 className="text-3xl hover:underline cursor-pointer">Home</h1></Link>
            <Link href="/about"><h1 className="text-3xl hover:underline cursor-pointer">About</h1></Link>
            <Link href="/contact"><h1 className="text-3xl hover:underline cursor-pointer">Contact</h1></Link>
            <Link href="/requirements"><h1 className="text-3xl hover:underline cursor-pointer">Requirements</h1></Link>
        </div>
        </>
    );
}