import { useNavigate } from "react-router";
import { DecisionPackReport } from "./DecisionPackReport";

export function DecisionPackPage() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/");
  };

  return <DecisionPackReport onBack={handleBack} />;
}
