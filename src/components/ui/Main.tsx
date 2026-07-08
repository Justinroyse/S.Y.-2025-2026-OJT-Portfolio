interface MainSectionProps {

}

// Top Just next to NavBar

export default function MainSection({}: MainSectionProps) {
    return (
        <>
        <div className="flex flex-col justify-start items-center text-brown-500 p-5 min-h-screen">
            <h1 className="text-3xl md:text-5xl">
                <span className="font-bold">Welcome to</span> <br></br> my OJT Portfolio
            </h1>
            <div className="mb-3"></div>
            <p className="text-lg md:text-xl">SY 2025 - 2026</p> 
            <div className="mb-3"></div>

            <div className="flex flex-col justify-center items-center text-brown-500 p-5">
                <h2 className="text-3xl md:text-4xl font-bold">Justin Royse L. Solomon </h2>
                <div className="mb-3"></div>
                <p className="text-lg md:text-xl">Bachelor of Science in Computer <br></br>Engineering CpE 2-6</p>
            </div>
        </div>
        </>
    );
}
