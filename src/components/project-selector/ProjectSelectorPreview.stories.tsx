import type { Meta, StoryObj } from '@storybook/react';
import ProjectSelectorPreview from './ProjectSelectorPreview';

const meta: Meta<typeof ProjectSelectorPreview> = {
  title: 'Project Selector/Apple White Preview',
  component: ProjectSelectorPreview,
  parameters: {
    layout: 'centered',
  },
};
export default meta;

type Story = StoryObj<typeof ProjectSelectorPreview>;

export const Default: Story = {
  render: () => <ProjectSelectorPreview />,
}; 