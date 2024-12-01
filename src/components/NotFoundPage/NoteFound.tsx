import { useNavigate } from 'react-router-dom'
export const NotFound = () => {
    const navigate = useNavigate()
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
            <h1 className="text-6xl font-bold text-gray-800">403</h1>
            <p className="text-2xl mt-4 font-semibold text-gray-700">
                Oops! This page is not available
            </p>
            <p className="mt-2 text-gray-600">
                The page you are looking for is not available.
            </p>
            <button
                onClick={() => navigate(-1)}
                className="mt-6 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
                Back Home
            </button>
        </div>
    </div>
    )
}