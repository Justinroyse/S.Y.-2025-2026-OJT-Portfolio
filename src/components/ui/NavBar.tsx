interface NavBarProps {
    
}

// Simple Navbar with Contact, About, and Requirements Buttons

export default function NavBar({  }: NavBarProps) {
    return (
        <>
        <div className="flex flex-col justify-center md:flex-row gap-5 bg-slate-600 text-white p-5">
            <h1 className="text-3xl hover:underline cursor-pointer">Home</h1>
            <h1 className="text-3xl hover:underline cursor-pointer">About</h1>
            <h1 className="text-3xl hover:underline cursor-pointer">Contact</h1>
            <h1 className="text-3xl hover:underline cursor-pointer">Requirements</h1>
        </div>
        </>
    );
}