function GenericButton({ onClick, text }) {
    return (
        <button 
            text="connect"
            onClick={onClick}
            className='p-3 bg-white rounded text-center shadow hover:bg-gray-100 transition' 
        >
            {text}
        </button>
    )
}

export default GenericButton;