import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card.jsx';
import { Badge } from './badge.jsx';
import { Button } from './button.jsx';
import { Crown, Lock } from 'lucide-react';

const ProFeatureCard = ({ 
  title, 
  description, 
  icon: Icon, 
  buttonText = "Upgrade to PRO",
  onUpgradeClick,
  className = "" 
}) => {
  return (
    <Card className={`border-border/50 relative overflow-hidden ${className}`}>
      <div className="absolute top-2 right-2">
        <Badge variant="secondary" className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black">
          <Crown className="w-3 h-3 mr-1" />
          PRO
        </Badge>
      </div>
      <CardHeader className="opacity-60">
        <CardTitle className="flex items-center text-muted-foreground">
          <Icon className="w-5 h-5 mr-2" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="opacity-60">
        <div className="flex items-center justify-center py-8">
          <Lock className="w-8 h-8 text-muted-foreground" />
        </div>
        <Button 
          variant="outline" 
          className="w-full" 
          disabled={!onUpgradeClick}
          onClick={onUpgradeClick}
        >
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProFeatureCard;