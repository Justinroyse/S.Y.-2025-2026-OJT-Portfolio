import NavBar from "@/components/ui/NavBar";
import Footer from "@/components/ui/Footer";

export default function About() {
    return (
        <>
        <NavBar />
        <div className="flex flex-col justify-start items-center text-brown-500 p-5 min-h-screen">
            <h1 className="text-3xl md:text-5xl">About Me</h1>
        </div>
        <Footer />
        </>
    );
}