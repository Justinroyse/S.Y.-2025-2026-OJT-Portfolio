import NavBar from "@/components/ui/NavBar";
import Footer from "@/components/ui/Footer";

// make two columns for the requirements

const requirements = [
    "Approval Sheet",
    "Company Profile",
    "Memorandum of Agreement",
    "Letter of Intent",
    "Letter of Endorsement",
    "Student Waiver",
    "Internship Agreement",
    "Consent Form",
    "Resume/CV",
    "Medical Certificate",
    "Insurance",
    "Weekly Report",
    "Weekly Photo Documentation",
    "Certificate of Completion",
    "Evaluation for Student Internship",
    "Evaluation for Supervisor",
    "Evaluation Instrument for HTE"
];

// make the grids responsive and also outputs links to the requirements

export default function Requirements() {
    return (
        <>
        <NavBar />
        <div className="flex flex-col justify-start items-center text-brown-500 p-5 min-h-screen">
            <h1 className="text-3xl md:text-5xl">Requirements</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {requirements.map((requirement, index) => (
                    <div key={index} className="p-4 border border-border rounded-lg md:w-[250px] lg:w-[500px]">
                        <h3 className="text-lg font-semibold">{requirement}</h3>
                    </div>
                ))}
            </div>
        </div>
        <Footer />
        </>
    );
}