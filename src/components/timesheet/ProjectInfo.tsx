// Project information display component
// Shows selected project and subproject with color coding

import React, { useRef, useEffect } from 'react';
import { Project, Subproject } from '@/types';
import { generateProjectColor, isColorCodedProjectsEnabled } from '@/lib/projectColors';

interface ProjectInfoProps {
  selectedProject?: Project;
  selectedSubproject?: Subproject;
}

const ProjectInfo: React.FC<ProjectInfoProps> = ({
  selectedProject,
  selectedSubproject
}) => {
  // This component is now empty since we're removing the duplicate display
  return null;
};

export default ProjectInfo;