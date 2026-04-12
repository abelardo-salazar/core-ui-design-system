import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './Card';
import { Button } from './Button';
import { Textarea } from './Textarea';
import { Checkbox } from './Checkbox';
import { Switch } from './Switch';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from './Select';
import { Text } from './Typography';

const meta: Meta = {
  title: 'Examples/AdvancedForm',
  parameters: { layout: 'centered' },
};

export default meta;

export const SettingsForm: StoryObj = {
  render: () => (
    <Card className="w-[450px]">
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Select Component */}
        <div className="space-y-2">
          <Text className="text-sm font-medium">Email Frequency</Text>
          <Select defaultValue="daily">
            <SelectTrigger>
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Frequency</SelectLabel>
                <SelectItem value="realtime">Real-time</SelectItem>
                <SelectItem value="daily">Daily Digest</SelectItem>
                <SelectItem value="weekly">Weekly Summary</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Switch Component */}
        <div className="flex items-center justify-between space-x-2">
          <div className="flex flex-col space-y-1">
            <Text className="text-sm font-medium">Marketing Emails</Text>
            <Text className="text-xs text-base-content">Receive offers and updates.</Text>
          </div>
          <Switch />
        </div>

        {/* Checkbox Component */}
        <div className="flex items-start space-x-2">
          <Checkbox id="terms" />
          <div className="grid gap-1.5 leading-none">
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Accept terms and conditions
            </label>
            <Text className="text-xs text-base-content">
              You agree to our Terms of Service and Privacy Policy.
            </Text>
          </div>
        </div>

        {/* Textarea Component */}
        <div className="space-y-2">
          <Text className="text-sm font-medium">Feedback</Text>
          <Textarea placeholder="Tell us what you think..." />
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Save Preferences</Button>
      </CardFooter>
    </Card>
  ),
};
