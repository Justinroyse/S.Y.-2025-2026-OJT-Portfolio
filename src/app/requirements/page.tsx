import NavBar from "@/components/ui/NavBar";
import Footer from "@/components/ui/Footer";
import Link from "next/link";

const requirements = [
    { name: "Approval Sheet", href: "#" },
    { name: "Company Profile", href: "#" },
    { name: "Memorandum of Agreement", href: "#" },
    { name: "Letter of Intent", href: "#" },
    { name: "Letter of Endorsement", href: "#" },
    { name: "Student Waiver", href: "#" },
    { name: "Internship Agreement", href: "#" },
    { name: "Consent Form", href: "#" },
    { name: "Resume/CV", href: "#" },
    { name: "Medical Certificate", href: "#" },
    { name: "Insurance", href: "#" },
    { name: "Weekly Report", href: "#" },
    { name: "Weekly Photo Documentation", href: "#" },
    { name: "Certificate of Completion", href: "#" },
    { name: "Evaluation for Student Internship", href: "#" },
    { name: "Evaluation for Supervisor", href: "#" },
    { name: "Evaluation Instrument for HTE", href: "#" }
];

// make the grids responsive and also outputs links to the requirements

export default function Requirements() {
    return (
        <>
        <NavBar />
        <div className="flex flex-col justify-start items-center text-brown-500 p-5 min-h-screen">
            <h1 className="text-3xl md:text-5xl mb-8">Requirements</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {requirements.map((req, index) => (
                    <Link 
                        key={index} 
                        href={req.href}
                        className="p-4 border border-slate-300 rounded-lg md:w-[250px] lg:w-[500px] hover:bg-slate-100 hover:border-slate-500 hover:shadow-md active:scale-[0.98] transition-all flex justify-between items-center group cursor-pointer"
                    >
                        <span className="text-lg font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">
                            {req.name}
                        </span>
                        <span className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all">
                            →
                        </span>
                    </Link>
                ))}
            </div>
        </div>
        <Footer />
        </>
    );
}