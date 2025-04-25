import { useState } from "react";
import { Connection } from "@shared/schema";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

interface ConnectionDialogProps {
  isOpen: boolean;
  connection: Connection;
  onClose: () => void;
  onConnect: () => void;
}

export default function ConnectionDialog({ 
  isOpen, 
  connection, 
  onClose, 
  onConnect 
}: ConnectionDialogProps) {
  const [authType, setAuthType] = useState<"password" | "certificate">("password");
  const [username, setUsername] = useState("administrator");
  const [password, setPassword] = useState("");
  const [rememberPassword, setRememberPassword] = useState(false);
  const [protocol, setProtocol] = useState("RDP");
  
  const handleSubmit = () => {
    onConnect();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect to Remote Desktop</DialogTitle>
          <DialogDescription>
            Enter your credentials to connect to this remote desktop.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="connection-name" className="text-right">
              Connection Name
            </Label>
            <Input
              id="connection-name"
              value={connection.name}
              className="col-span-3"
              readOnly
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="host-address" className="text-right">
              Host Address
            </Label>
            <Input
              id="host-address"
              value={connection.host}
              className="col-span-3"
              readOnly
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="protocol" className="text-right">
              Protocol
            </Label>
            <Select
              value={protocol}
              onValueChange={setProtocol}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select protocol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RDP">RDP</SelectItem>
                <SelectItem value="VNC">VNC</SelectItem>
                <SelectItem value="SSH">SSH</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Authentication</Label>
            <RadioGroup 
              className="flex col-span-3 space-x-4" 
              defaultValue="password"
              value={authType}
              onValueChange={(value) => setAuthType(value as "password" | "certificate")}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="password" id="auth-password" />
                <Label htmlFor="auth-password" className="cursor-pointer">Password</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="certificate" id="auth-certificate" />
                <Label htmlFor="auth-certificate" className="cursor-pointer">Certificate</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Username
            </Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="col-span-3"
            />
          </div>
          {authType === "password" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="col-span-3"
                placeholder="••••••••"
              />
            </div>
          )}
          {authType === "certificate" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="certificate" className="text-right">
                Certificate
              </Label>
              <div className="col-span-3">
                <Input id="certificate" type="file" className="hidden" />
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => document.getElementById("certificate")?.click()}>
                    Select certificate
                  </Button>
                  <span className="text-sm text-neutral-400">No certificate selected</span>
                </div>
              </div>
            </div>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="col-span-3 col-start-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="remember-password" 
                  checked={rememberPassword}
                  onCheckedChange={(checked) => setRememberPassword(checked as boolean)}
                />
                <Label htmlFor="remember-password">Remember password</Label>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit}>
            Connect
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
