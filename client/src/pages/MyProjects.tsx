import { useEffect, useState } from 'react'
import type { Project } from '../types';
import { Loader2, Plus, TrashIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import api from '@/configs/axios';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth-client';

const MyProjects = () => {
    const {data: session, isPending} = authClient.useSession()
    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState<Project[]>([])
    const navigate = useNavigate()

    const fetchProjects = async () => {
        try {
            const {data} = await api.get('/api/user/projects')
            setProjects(data.projects)
            setLoading(false)
        } catch (error : any) {
            console.log(error);
            toast.error(error?.response?.data?.message || error.message)
        }
    }

    const deleteProject = async(projectId:String) => {
        try {
            const confirm = window.confirm('Are you sure you want to delete this project?');
            if(!confirm) return;
            const {data} = await api.delete(`/api/project/${projectId}`)
            toast.success(data.message);
            fetchProjects()
        } catch (error : any) {
            console.log(error);
            toast.error(error?.response?.data?.message || error.message)
        }
    }

    useEffect(() => {
        if(session?.user && !isPending) {
            fetchProjects()
        } else if(!isPending && !session?.user) {
            navigate('/');
            toast('Please login to view your projects')
        }
        
    }, [session?.user])

    return (
        <>
        <div className="px-4 md:px-16 lg:px-24 xl:px-32">

            {/* LOADING STATE */}
            {loading ? (
                <div className="flex items-center justify-center h-[80vh]">
                    <Loader2 className="size-10 animate-spin text-indigo-300" />
                </div>
            ) : projects.length > 0 ? (

                /* PROJECT LIST */
                <div className="py-10 min-h-[80vh]">
                    <div className="flex items-center justify-between mb-12">
                        <h1 className="text-2xl font-semibold text-white">My Projects</h1>

                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center gap-2 text-white px-6 py-2 rounded-lg 
                                       bg-gradient-to-br from-indigo-500 to-indigo-600 
                                       hover:opacity-90 active:scale-95 transition"
                        >
                            <Plus size={20} />
                            <span className="text-sm sm:text-base">Create New</span>
                        </button>
                    </div>

                    {/* PROJECT CARDS */}
                    <div className="flex flex-wrap gap-4">
                        {projects.map((project) => (
                            <div onClick={()=>navigate(`/projects/${project.id}`)}
                                key={project.id}
                                className="relative w-72 max-sm:mx-auto cursor-pointer 
                                           bg-gray-900/60 border border-gray-700 rounded-lg 
                                           overflow-hidden shadow-md hover:shadow-indigo-700/30 
                                           hover:border-indigo-800/80 transition-all duration-300 group"
                            >

                                {/* Desktop Preview */}
                                <div className="relative w-full h-40 bg-gray-900 overflow-hidden border-b border-gray-800">
                                    {project.current_code ? (
                                        <iframe
                                            srcDoc={project.current_code}
                                            className="absolute top-0 left-0 w-[1200px] h-[800px] 
                                                       origin-top-left pointer-events-none"
                                            sandbox="allow-scripts allow-same-origin"
                                            style={{ transform: 'scale(0.25)' }}
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-500">
                                            <p>No Preview</p>
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-4 text-white bg-gradient-to-b
                                                from-transparent group-hover:from-indigo-950 
                                                to-transparent transition-colors">
                                    <div className="flex items-start justify-between">
                                        <h2 className="text-lg font-medium line-clamp-2">
                                            {project.name}
                                        </h2>

                                        {/* WEBSITE BUTTON */}
                                        <button
                                            className="px-2.5 py-0.5 mt-1 ml-2 text-xs bg-gray-800 
                                                       border border-gray-700 rounded-full 
                                                       group-hover:border-indigo-700 
                                                       group-hover:text-indigo-300 transition"
                                        >
                                            Website
                                        </button>
                                    </div>

                                    <p className="text-gray-400 mt-1 text-sm line-clamp-2">
                                        {project.initial_prompt}
                                    </p>
                                    <div onClick={(e)=>e.stopPropagation()} 
                                    className='flex justify-between items-center mt-6'>
                                        <span className='text-xs text-gray-500'>
                                            {new Date(project.createdAt).toLocaleDateString()}
                                            </span>
                                            <div className='flex gap-3 text-white text-sm'>
                                                <button onClick={()=>navigate(`/preview/${project.id}`)} className='px-3 py1.5 bg-white/10
                                                hover:bg-white/15 rounded-md transition-all'>Preview</button>
                                                <button onClick={()=>navigate(`/projects/${project.id}`)} className='px-3 py-1.5 bg-white/10 hover:
                                                bg-white/15 rounded-md transition-colors'>open</button>
                                            </div>
                                    </div>
                                </div>
                                <div onClick={e => e.stopPropagation()}>
                                    <TrashIcon className='absolute top-3 right-3
                                    scale-0 group-hover:scale-100 bg-white p1.5 size-7
                                    rounded text-red-500 text-xl cursor-pointer transition-all'
                                    onClick={()=>deleteProject(project.id)} />
                                </div>
                            </div>
                        ))}
                    </div>

                </div>

            ) : (

                /* EMPTY STATE */
                <div className="flex flex-col items-center justify-center h-[80vh]">
                    <h1 className="text-3xl font-semibold text-gray-300">
                        You have no projects yet!
                    </h1>

                    <button
                        onClick={() => navigate('/')}
                        className="mt-6 text-white px-6 py-2 rounded-lg bg-indigo-600 
                                   hover:bg-indigo-700 active:scale-95 transition"
                    >
                        Create Your First Project
                    </button>
                </div>
            )}
        </div>
        <Footer />
        </>
    )
}

export default MyProjects
