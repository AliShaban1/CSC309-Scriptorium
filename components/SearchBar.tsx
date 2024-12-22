interface SearchBarProps {
    placeholder: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ placeholder }) => {
    return (
        <div className="mb-8">
            <input
                type="text"
                placeholder={placeholder}
                className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
            />
        </div>
    );
};

export default SearchBar;
