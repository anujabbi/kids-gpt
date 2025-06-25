
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface HomeworkScoreBadgeProps {
  score: number;
}

const getScoreColor = (score: number) => {
  if (score <= 20) return 'bg-green-500';
  if (score <= 40) return 'bg-green-400';
  if (score <= 60) return 'bg-yellow-500';
  if (score <= 80) return 'bg-orange-500';
  return 'bg-red-500';
};

const getScoreLabel = (score: number) => {
  if (score <= 20) return 'Educational';
  if (score <= 40) return 'Mostly Learning';
  if (score <= 60) return 'Mixed';
  if (score <= 80) return 'Likely Homework';
  return 'Homework Copying';
};

const getScoreDescription = (score: number) => {
  if (score <= 20) return "This response encourages learning and critical thinking.";
  if (score <= 40) return "This response is mostly educational with some direct information.";
  if (score <= 60) return "This response has mixed educational and direct answer content.";
  if (score <= 80) return "This response may be providing homework help with minimal learning.";
  return "This response appears to be providing direct homework answers.";
};

export function HomeworkScoreBadge({ score }: HomeworkScoreBadgeProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge 
          variant="outline" 
          className={`text-white text-xs ${getScoreColor(score)}`}
        >
          Homework Misuse Score: {score}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <div className="text-xs">
          <div className="font-medium">{getScoreLabel(score)}</div>
          <div className="text-gray-600 mt-1">
            {getScoreDescription(score)}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
