import Image from "next/image";

interface MainSectionProps {

}

// Top Just next to NavBar

export default function MainSection({}: MainSectionProps) {
    return (
        <>
        <main className="flex flex-row justify-around">
            <Image src="/left_main.png" alt="Profile" width={819} height={318} />
            <Image src="/right_main.png" alt="CompEng" width={861} height={388} />
        </main> 
        </>
    );
}
