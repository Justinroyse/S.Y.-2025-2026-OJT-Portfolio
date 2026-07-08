interface FooterProps {

}

// Make footer at the bottom of the screen always   


export default function Footer({}: FooterProps) {
    return (
        <>
        <div className="flex flex-col justify-end items-center bg-slate-600 text-white p-5 w-full z-50">
            <p className="text-sm">Justin Royse Solomon | BS CpE 2-6 | SY 2025 - 2026</p>
        </div>
        </>
    );
}
