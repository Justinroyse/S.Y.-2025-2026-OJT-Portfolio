import Link from "next/link";
import Image from "next/image";
interface NavBarProps {
    
}

// Simple Navbar with Contact, About, and Requirements Buttons

export default function NavBar({  }: NavBarProps) {
    return (
        <>
        <div className="flex flex-row justify-start gap-133 bg-[#563B32] text-white p-5 ">
            <Image src="/logo.svg" alt="logo icon" width={235} height={75} />
            <div className="flex gap-x-22.5 justify-center">
                <div className="place-content-center">
                    <Link href="/">
                        <Image src="/Home.svg" alt="Home Icon" width={35} height={35} />
                    </Link>
                </div>
                <div className="place-content-center">
                    <Link href="/contact">
                        <Image src="/Bell.svg" alt="Contact Icon" width={35} height={35} />
                    </Link>
                </div>
                <div className="place-content-center">
                    <Link href="/requirements">
                        <Image src="/Archive.svg" alt="Requirements Icon" width={35} height={35} />
                    </Link>
                </div>
            </div>
        </div>
        </>
    );
}