export default function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="w-[95%] lg:w-[90%] max-w-7xl mx-auto py-8 mt-auto border-t border-slate-200">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-navy-800 text-sm">RepoIntoGraph</span>
          <span className="text-slate-400 text-sm">&copy; {currentYear}</span>
        </div>
        
        <div className="flex items-center gap-4 text-sm font-medium">
          <a 
            href="https://github.com/HuongDS/Repo_Into_Graph" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-navy-600 transition-colors"
          >
            GitHub
          </a>
          <span className="text-slate-300">•</span>
          <a href="#" className="text-slate-500 hover:text-navy-600 transition-colors">Documentation</a>
        </div>
      </div>
    </footer>
  )
}
