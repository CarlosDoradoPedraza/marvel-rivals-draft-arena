
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreateRoomProps {
  onCreateRoom: (settings: {
    team1Name: string;
    team2Name: string;
    startingTeam: string;
    bansPerTeam: number;
    protectsPerTeam: number;
    draftMode: 'MRC' | 'MRI';
  }) => void;
}

const CreateRoom: React.FC<CreateRoomProps> = ({ onCreateRoom }) => {
  const [settings, setSettings] = useState({
    team1Name: 'Team 1',
    team2Name: 'Team 2',
    startingTeam: 'team1',
    bansPerTeam: 3,
    protectsPerTeam: 2,
    draftMode: 'MRC' as 'MRC' | 'MRI',
  });

  const handleChange = (key: string, value: string | number) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <Card className="w-full max-w-md mx-auto border shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl text-center text-[#D53C53]">Create Draft Room</CardTitle>
        <CardDescription className="text-center text-gray-600">
          Configure your draft settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="team1-name" className="text-gray-700">Team 1 Name</Label>
          <Input
            id="team1-name"
            type="text"
            value={settings.team1Name}
            onChange={(e) => handleChange('team1Name', e.target.value)}
            placeholder="Enter team 1 name"
            className="bg-white border"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="team2-name" className="text-gray-700">Team 2 Name</Label>
          <Input
            id="team2-name"
            type="text"
            value={settings.team2Name}
            onChange={(e) => handleChange('team2Name', e.target.value)}
            placeholder="Enter team 2 name"
            className="bg-white border"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="draft-mode" className="text-gray-700">Draft Format</Label>
          <Select 
            value={settings.draftMode} 
            onValueChange={(value) => handleChange('draftMode', value)}
          >
            <SelectTrigger id="draft-mode" className="bg-white border">
              <SelectValue placeholder="Select draft format" />
            </SelectTrigger>
            <SelectContent className="bg-white border">
              <SelectItem value="MRC">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  <span>MRC Draft (Championship)</span>
                </div>
              </SelectItem>
              <SelectItem value="MRI">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                  <span>MRI Draft (Pro Ignite)</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="starting-team" className="text-gray-700">Starting Team</Label>
          <Select 
            value={settings.startingTeam} 
            onValueChange={(value) => handleChange('startingTeam', value)}
          >
            <SelectTrigger id="starting-team" className="bg-white border">
              <SelectValue placeholder="Select team" />
            </SelectTrigger>
            <SelectContent className="bg-white border">
              <SelectItem value="team1">{settings.team1Name}</SelectItem>
              <SelectItem value="team2">{settings.team2Name}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {settings.draftMode === 'MRC' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="bans" className="text-gray-700">Bans per Team</Label>
              <Select 
                value={settings.bansPerTeam.toString()} 
                onValueChange={(value) => handleChange('bansPerTeam', parseInt(value))}
              >
                <SelectTrigger id="bans" className="bg-white border">
                  <SelectValue placeholder="Select number" />
                </SelectTrigger>
                <SelectContent className="bg-white border">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="protects" className="text-gray-700">Protects per Team</Label>
              <Select 
                value={settings.protectsPerTeam.toString()} 
                onValueChange={(value) => handleChange('protectsPerTeam', parseInt(value))}
              >
                <SelectTrigger id="protects" className="bg-white border">
                  <SelectValue placeholder="Select number" />
                </SelectTrigger>
                <SelectContent className="bg-white border">
                  {[1, 2, 3, 4].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {settings.draftMode === 'MRI' && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <h4 className="font-medium text-orange-800 mb-2">MRI Draft - Fixed Format</h4>
            <div className="text-sm text-orange-700 space-y-1">
              <p>• 4 bans per team (enemy restrictions only)</p>
              <p>• 2 protections per team</p>
              <p>• Fixed sequence cannot be modified</p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full bg-[#D53C53] hover:bg-[#c02d45] text-white"
          onClick={() => onCreateRoom(settings)}
        >
          Create Room
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CreateRoom;
