import { CardProps } from "@/types";

const Card: React.FC<CardProps> = ({ title, description }) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow hover:shadow-lg">
      <h3 className="font-bold">{title}</h3>
      <p>{description}</p>
    </div>
  );
};

export default Card;
