import React from "react";

export const helpContent = {
  "/": {
    title: "Dashboard Help",
    description: (
      <>
        <p className="mb-4">Welcome to the ToolTrackerHub dashboard! Here's how to use this screen:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Use the search bar to find tools by name or location</li>
          <li>Each tool card shows the tool's name and location hierarchy</li>
          <li>The status indicator shows if a tool is available, in use, or in maintenance</li>
          <li>Click on a tool card to view more details or edit the tool</li>
        </ul>
      </>
    )
  },
  "/add-tool": {
    title: "Add Tool Help",
    description: (
      <>
        <p className="mb-4">Here's how to add a new tool:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Enter a unique tool name - duplicate names are not allowed</li>
          <li>Specify the primary location where the tool will be stored</li>
          <li>Optionally add sub-locations for more specific placement</li>
          <li>Select the tool's current status</li>
          <li>Click "Add Tool" to save the new tool to the system</li>
        </ul>
      </>
    )
  },
  "/storage": {
    title: "Storage Management Help",
    description: (
      <>
        <p className="mb-4">Storage management screen guide:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Switch between "Tools" and "Photos" tabs to manage different aspects</li>
          <li>Tools tab:
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>View and manage all storage locations</li>
              <li>See which tools are stored in each location</li>
              <li>Click the photo icon next to a location to view its photos</li>
              <li>Organize tools by dragging them between locations</li>
            </ul>
          </li>
          <li>Photos tab:
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Click "Upload Photo" to add new location photos</li>
              <li>Enter a clear, descriptive location name for each photo</li>
              <li>Use high-quality, well-lit photos that clearly show the location</li>
              <li>Photos help team members identify correct tool locations</li>
              <li>Click any photo to view it in full size</li>
              <li>Delete photos using the trash icon if they're outdated</li>
            </ul>
          </li>
        </ul>
      </>
    )
  },
  "/settings": {
    title: "Settings Help",
    description: (
      <>
        <p className="mb-4">Settings screen overview:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Manage your account preferences</li>
          <li>Customize notification settings</li>
          <li>Update your profile information</li>
          <li>Configure system-wide settings</li>
        </ul>
      </>
    )
  },
  "/projects": {
    title: "Projects Help",
    description: (
      <>
        <p className="mb-4">Welcome to the Projects page! Here's how to manage your projects:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Creating a New Project:
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Click the "New Project" button in the top-right</li>
              <li>Enter a project name, status, and optional target date</li>
              <li>Add any relevant notes about the project</li>
            </ul>
          </li>
          <li>Managing Materials:
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Click the "$" icon on any project card</li>
              <li>Enter material name, cost, and quantity</li>
              <li>Click "Add Material" to save</li>
              <li>View all materials in the project card</li>
            </ul>
          </li>
          <li>Managing Tools:
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Click the "wrench" icon on any project card</li>
              <li>Select tools from your inventory to assign to the project</li>
              <li>Use arrows to move tools between available and selected lists</li>
            </ul>
          </li>
          <li>Project Features:
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Edit project details using the pencil icon</li>
              <li>Delete projects with the trash icon</li>
              <li>Track project status: Planned, Ongoing, or Completed</li>
              <li>Use "Project Helper" for AI assistance with your project</li>
            </ul>
          </li>
        </ul>
      </>
    )
  },
  default: {
    title: "Help",
    description: "Welcome to ToolTrackerHub! Select any section to get started."
  }
};