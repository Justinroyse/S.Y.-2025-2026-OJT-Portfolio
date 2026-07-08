import ProjectCard from "@/components/ui/ProjectCard";
export default function ProjectsPage() {
    const myProjects = [
        {
            title: "Project 1",
            description: "Project 1 Description",
            tags: ["Tag 1", "Tag 2", "Tag 3"],
        },
        {
            title: "Project 2",
            description: "Project 2 Description",
            tags: ["Tag 4", "Tag 5", "Tag 6"],
        },
        {
            title: "Project 3",
            description: "Project 3 Description",
            tags: ["Tag 7", "Tag 8", "Tag 9"],
        },
    ]
    return (
        <div>
            <h1>Projects</h1>
            {myProjects.map((project, index) => (
                <ProjectCard
                    key={index}
                    title={project.title}
                    description={project.description}
                    tags={project.tags}
                />
            ))}
        </div>
    )
}