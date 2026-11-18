export const DEFAULT_SCRIPT_VERSION = 'v1.4.3 [BETA]';
export const DEFAULT_RELEASE_TITLE = 'RGB SCRIPTS v1.4.3 [BETA] Released!';
export const DEFAULT_RELEASE_MESSAGE =
  'Official RGB script is now available — includes Plan Selection, Game Info, Box ESP, Tracer Lines, and Health ESP for Solara & Xeno.';
export const DEFAULT_SCRIPT_UPDATED_AT = '2026-11-18T03:53:45Z';

export const DEFAULT_OFFICIAL_SCRIPT = `-- // SERVICES
local CoreGui = game:GetService("CoreGui")
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local TweenService = game:GetService("TweenService")
local UserInputService = game:GetService("UserInputService")
local Workspace = game:GetService("Workspace")
local MarketplaceService = game:GetService("MarketplaceService")

-- // CONFIGURATION
local SCRIPT_NAME = "RGB SCRIPTS"
local VERSION = "v1.4.3 [BETA]"
local AI_PLATFORM = "RGB5.6 AGROX"
local DEVELOPER = "ALEX"

-- // THEME COLORS
local Theme = {
    Background = Color3.fromRGB(15, 15, 15),
    Text = Color3.fromRGB(255, 255, 255),
    SubText = Color3.fromRGB(150, 150, 150),
    Accent = Color3.fromRGB(200, 200, 200),
    Transparent = 0.15,
    Stroke = Color3.fromRGB(255, 255, 255),
    Green = Color3.fromRGB(100, 255, 100),
    Red = Color3.fromRGB(255, 100, 100),
    Blue = Color3.fromRGB(100, 150, 255),
    Gold = Color3.fromRGB(255, 200, 50)
}

-- // CLEANUP PREVIOUS INSTANCES
if CoreGui:FindFirstChild("RGB_Scripts_UI") then
    CoreGui:FindFirstChild("RGB_Scripts_UI"):Destroy()
end

-- // CREATE MAIN GUI
local ScreenGui = Instance.new("ScreenGui")
ScreenGui.Name = "RGB_Scripts_UI"
ScreenGui.ResetOnSpawn = false
ScreenGui.IgnoreGuiInset = true
ScreenGui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling
ScreenGui.Parent = CoreGui

-- // RESPONSIVENESS (UI SCALE)
local UIScale = Instance.new("UIScale")
UIScale.Parent = ScreenGui

local function updateScale()
    local viewport = Workspace.CurrentCamera.ViewportSize
    if viewport.X < 600 then
        UIScale.Scale = 0.6
    elseif viewport.X < 900 then
        UIScale.Scale = 0.8
    else
        UIScale.Scale = 1.0
    end
end
updateScale()
Workspace.CurrentCamera:GetPropertyChangedSignal("ViewportSize"):Connect(updateScale)

-- // FORWARD DECLARATION
local MainFrame 

-- // =========================================================================
-- // PLAN SELECTION UI
-- // =========================================================================
local PlanSelectionFrame = Instance.new("Frame")
PlanSelectionFrame.Size = UDim2.new(0, 650, 0, 400)
PlanSelectionFrame.Position = UDim2.new(0.5, 0, 0.5, 0)
PlanSelectionFrame.AnchorPoint = Vector2.new(0.5, 0.5)
PlanSelectionFrame.BackgroundColor3 = Theme.Background
PlanSelectionFrame.BackgroundTransparency = 0.05
PlanSelectionFrame.BorderSizePixel = 0
PlanSelectionFrame.Parent = ScreenGui

local planGradient = Instance.new("UIGradient")
planGradient.Color = ColorSequence.new{
    ColorSequenceKeypoint.new(0, Color3.fromRGB(25, 25, 25)),
    ColorSequenceKeypoint.new(1, Color3.fromRGB(10, 10, 10))
}
planGradient.Rotation = 45
planGradient.Parent = PlanSelectionFrame

local PlanCorner = Instance.new("UICorner")
PlanCorner.CornerRadius = UDim.new(0, 16)
PlanCorner.Parent = PlanSelectionFrame

local PlanStroke = Instance.new("UIStroke")
PlanStroke.Color = Theme.Stroke
PlanStroke.Thickness = 1
PlanStroke.Transparency = 0.8
PlanStroke.Parent = PlanSelectionFrame

local PlanTitle = Instance.new("TextLabel")
PlanTitle.Size = UDim2.new(1, 0, 0, 40)
PlanTitle.Position = UDim2.new(0, 0, 0, 25)
PlanTitle.BackgroundTransparency = 1
PlanTitle.Text = "CHOOSE YOUR PLAN"
PlanTitle.TextColor3 = Theme.Text
PlanTitle.Font = Enum.Font.GothamBold
PlanTitle.TextSize = 28
PlanTitle.Parent = PlanSelectionFrame

local PlanSubtitle = Instance.new("TextLabel")
PlanSubtitle.Size = UDim2.new(1, 0, 0, 20)
PlanSubtitle.Position = UDim2.new(0, 0, 0, 60)
PlanSubtitle.BackgroundTransparency = 1
PlanSubtitle.Text = "Unlock the full potential of RGB SCRIPTS"
PlanSubtitle.TextColor3 = Theme.SubText
PlanSubtitle.Font = Enum.Font.Gotham
PlanSubtitle.TextSize = 14
PlanSubtitle.Parent = PlanSelectionFrame

local PlanContainer = Instance.new("Frame")
PlanContainer.Size = UDim2.new(1, -40, 0, 250)
PlanContainer.Position = UDim2.new(0, 20, 0, 100)
PlanContainer.BackgroundTransparency = 1
PlanContainer.Parent = PlanSelectionFrame

local PlanLayout = Instance.new("UIListLayout")
PlanLayout.FillDirection = Enum.FillDirection.Horizontal
PlanLayout.HorizontalAlignment = Enum.HorizontalAlignment.Center
PlanLayout.VerticalAlignment = Enum.VerticalAlignment.Center
PlanLayout.Padding = UDim.new(0, 15)
PlanLayout.Parent = PlanContainer

local function createPlanCard(name, price, features, accentColor, isAvailable)
    local card = Instance.new("Frame")
    card.Size = UDim2.new(0, 180, 0, 240)
    card.BackgroundColor3 = Theme.Background
    card.BackgroundTransparency = 0.2
    card.Parent = PlanContainer
    
    local cardScale = Instance.new("UIScale")
    cardScale.Parent = card
    
    local cardCorner = Instance.new("UICorner")
    cardCorner.CornerRadius = UDim.new(0, 12)
    cardCorner.Parent = card
    
    local cardStroke = Instance.new("UIStroke")
    cardStroke.Color = accentColor
    cardStroke.Thickness = 2
    cardStroke.Transparency = isAvailable and 0.2 or 0.8
    cardStroke.Parent = card
    
    local header = Instance.new("Frame")
    header.Size = UDim2.new(1, 0, 0, 50)
    header.BackgroundColor3 = accentColor
    header.BackgroundTransparency = isAvailable and 0.8 or 0.95
    header.Parent = card
    
    local headerCorner = Instance.new("UICorner")
    headerCorner.CornerRadius = UDim.new(0, 12)
    headerCorner.Parent = header
    
    local headerFix = Instance.new("Frame")
    headerFix.Size = UDim2.new(1, 0, 0, 12)
    headerFix.Position = UDim2.new(0, 0, 1, -12)
    headerFix.BackgroundColor3 = accentColor
    headerFix.BackgroundTransparency = isAvailable and 0.8 or 0.95
    headerFix.BorderSizePixel = 0
    headerFix.Parent = header
    
    local titleText = Instance.new("TextLabel")
    titleText.Size = UDim2.new(1, 0, 0, 30)
    titleText.Position = UDim2.new(0, 0, 0, 10)
    titleText.BackgroundTransparency = 1
    titleText.Text = name
    titleText.TextColor3 = isAvailable and accentColor or Theme.SubText
    titleText.Font = Enum.Font.GothamBold
    titleText.TextSize = 20
    titleText.Parent = header
    
    local priceText = Instance.new("TextLabel")
    priceText.Size = UDim2.new(1, 0, 0, 20)
    priceText.Position = UDim2.new(0, 0, 0, 65)
    priceText.BackgroundTransparency = 1
    priceText.Text = price
    priceText.TextColor3 = Theme.Text
    priceText.Font = Enum.Font.GothamMedium
    priceText.TextSize = 14
    priceText.Parent = card
    
    local featureText = Instance.new("TextLabel")
    featureText.Size = UDim2.new(1, -20, 0, 100)
    featureText.Position = UDim2.new(0, 10, 0, 95)
    featureText.BackgroundTransparency = 1
    featureText.Text = features
    featureText.TextColor3 = Theme.SubText
    featureText.Font = Enum.Font.Gotham
    featureText.TextSize = 12
    featureText.TextYAlignment = Enum.TextYAlignment.Top
    featureText.Parent = card
    
    local selectBtn = Instance.new("TextButton")
    selectBtn.Size = UDim2.new(0, 140, 0, 35)
    selectBtn.Position = UDim2.new(0.5, -70, 1, -50)
    selectBtn.BackgroundColor3 = accentColor
    selectBtn.BackgroundTransparency = isAvailable and 0.2 or 0.9
    selectBtn.Text = isAvailable and "SELECT" or "LOCKED"
    selectBtn.TextColor3 = isAvailable and Theme.Background or Theme.SubText
    selectBtn.Font = Enum.Font.GothamBold
    selectBtn.TextSize = 14
    selectBtn.AutoButtonColor = false
    selectBtn.Parent = card
    
    local btnCorner = Instance.new("UICorner")
    btnCorner.CornerRadius = UDim.new(0, 6)
    btnCorner.Parent = selectBtn
    
    if isAvailable then
        card.MouseEnter:Connect(function()
            TweenService:Create(cardScale, TweenInfo.new(0.2, Enum.EasingStyle.Quart), {Scale = 1.05}):Play()
            TweenService:Create(cardStroke, TweenInfo.new(0.2), {Transparency = 0}):Play()
            TweenService:Create(selectBtn, TweenInfo.new(0.2), {BackgroundTransparency = 0}):Play()
        end)
        card.MouseLeave:Connect(function()
            TweenService:Create(cardScale, TweenInfo.new(0.2, Enum.EasingStyle.Quart), {Scale = 1}):Play()
            TweenService:Create(cardStroke, TweenInfo.new(0.2), {Transparency = 0.2}):Play()
            TweenService:Create(selectBtn, TweenInfo.new(0.2), {BackgroundTransparency = 0.2}):Play()
        end)
    end
    
    return selectBtn
end

local FreeBtn = createPlanCard("FREE", "Free Forever", "• Basic ESP Features\\n• Box & Line ESP\\n• Health ESP", Theme.Green, true)
local ProBtn = createPlanCard("PRO", "$4.99 / mo", "• Everything in Free\\n• Aimbot & FOV\\n• Priority Support", Theme.Blue, false)
local MaxBtn = createPlanCard("MAX", "$9.99 / mo", "• Everything in PRO\\n• Max Optimization\\n• Custom Features", Theme.Gold, false)

FreeBtn.MouseButton1Click:Connect(function()
    for _, v in pairs(PlanSelectionFrame:GetDescendants()) do
        if v:IsA("Frame") or v:IsA("TextButton") then
            TweenService:Create(v, TweenInfo.new(0.4), {BackgroundTransparency = 1}):Play()
        end
        if v:IsA("TextLabel") or v:IsA("TextButton") then
            TweenService:Create(v, TweenInfo.new(0.4), {TextTransparency = 1}):Play()
        end
        if v:IsA("UIStroke") then
            TweenService:Create(v, TweenInfo.new(0.4), {Transparency = 1}):Play()
        end
    end
    
    TweenService:Create(PlanSelectionFrame, TweenInfo.new(0.4), {BackgroundTransparency = 1}):Play()
    task.wait(0.4)
    PlanSelectionFrame:Destroy()
    
    MainFrame.Visible = true
    MainFrame.Size = UDim2.new(0, 0, 0, 0)
    TweenService:Create(MainFrame, TweenInfo.new(0.5, Enum.EasingStyle.Quart, Enum.EasingDirection.Out), {
        Size = UDim2.new(0, 520, 0, 380),
        BackgroundTransparency = Theme.Transparent
    }):Play()
end)

ProBtn.MouseButton1Click:Connect(function()
    ProBtn.Text = "NOT AVAILABLE"
    TweenService:Create(ProBtn, TweenInfo.new(0.2), {TextColor3 = Theme.Red, BackgroundColor3 = Theme.Red}):Play()
end)

MaxBtn.MouseButton1Click:Connect(function()
    MaxBtn.Text = "NOT AVAILABLE"
    TweenService:Create(MaxBtn, TweenInfo.new(0.2), {TextColor3 = Theme.Red, BackgroundColor3 = Theme.Red}):Play()
end)


-- // =========================================================================
-- // MAIN UI
-- // =========================================================================
MainFrame = Instance.new("Frame")
MainFrame.Name = "MainFrame"
MainFrame.Size = UDim2.new(0, 520, 0, 380)
MainFrame.Position = UDim2.new(0.5, 0, 0.5, 0)
MainFrame.AnchorPoint = Vector2.new(0.5, 0.5)
MainFrame.BackgroundColor3 = Theme.Background
MainFrame.BackgroundTransparency = 1 
MainFrame.BorderSizePixel = 0
MainFrame.ClipsDescendants = true
MainFrame.Visible = false 
MainFrame.Parent = ScreenGui

local MainCorner = Instance.new("UICorner")
MainCorner.CornerRadius = UDim.new(0, 12)
MainCorner.Parent = MainFrame

local MainStroke = Instance.new("UIStroke")
MainStroke.Color = Theme.Stroke
MainStroke.Thickness = 1
MainStroke.Transparency = 0.8
MainStroke.Parent = MainFrame

local Header = Instance.new("Frame")
Header.Name = "Header"
Header.Size = UDim2.new(1, 0, 0, 50)
Header.BackgroundTransparency = 1
Header.Parent = MainFrame

local Title = Instance.new("TextLabel")
Title.Size = UDim2.new(0, 200, 1, 0)
Title.Position = UDim2.new(0, 20, 0, 0)
Title.BackgroundTransparency = 1
Title.Text = SCRIPT_NAME
Title.TextColor3 = Theme.Text
Title.Font = Enum.Font.GothamBold
Title.TextSize = 18
Title.TextXAlignment = Enum.TextXAlignment.Left
Title.Parent = Header

local VersionLabel = Instance.new("TextLabel")
VersionLabel.Size = UDim2.new(0, 100, 1, 0)
VersionLabel.Position = UDim2.new(0, 140, 0, 0)
VersionLabel.BackgroundTransparency = 1
VersionLabel.Text = VERSION
VersionLabel.TextColor3 = Theme.SubText
VersionLabel.Font = Enum.Font.Gotham
VersionLabel.TextSize = 12
VersionLabel.TextXAlignment = Enum.TextXAlignment.Left
VersionLabel.Parent = Header

local ControlContainer = Instance.new("Frame")
ControlContainer.Size = UDim2.new(0, 80, 1, 0)
ControlContainer.Position = UDim2.new(1, -90, 0, 0)
ControlContainer.BackgroundTransparency = 1
ControlContainer.Parent = Header

local UIControlsLayout = Instance.new("UIListLayout")
UIControlsLayout.FillDirection = Enum.FillDirection.Horizontal
UIControlsLayout.HorizontalAlignment = Enum.HorizontalAlignment.Right
UIControlsLayout.VerticalAlignment = Enum.VerticalAlignment.Center
UIControlsLayout.Padding = UDim.new(0, 10)
UIControlsLayout.Parent = ControlContainer

local function createControlButton(text, color)
    local btn = Instance.new("TextButton")
    btn.Size = UDim2.new(0, 28, 0, 28)
    btn.BackgroundColor3 = color
    btn.BackgroundTransparency = 0.8
    btn.Text = text
    btn.TextColor3 = Theme.Text
    btn.Font = Enum.Font.GothamBold
    btn.TextSize = 14
    btn.AutoButtonColor = false
    btn.Parent = ControlContainer
    
    local corner = Instance.new("UICorner")
    corner.CornerRadius = UDim.new(1, 0)
    corner.Parent = btn
    
    btn.MouseEnter:Connect(function()
        TweenService:Create(btn, TweenInfo.new(0.2, Enum.EasingStyle.Sine), {BackgroundTransparency = 0.4, TextColor3 = Theme.Background}):Play()
    end)
    btn.MouseLeave:Connect(function()
        TweenService:Create(btn, TweenInfo.new(0.2, Enum.EasingStyle.Sine), {BackgroundTransparency = 0.8, TextColor3 = Theme.Text}):Play()
    end)
    
    return btn
end

local MinimizeBtn = createControlButton("-", Theme.Accent)
local CloseBtn = createControlButton("X", Theme.Text)

local TabContainer = Instance.new("Frame")
TabContainer.Size = UDim2.new(1, -20, 0, 35)
TabContainer.Position = UDim2.new(0, 10, 0, 55)
TabContainer.BackgroundTransparency = 1
TabContainer.Parent = MainFrame

local TabLayout = Instance.new("UIListLayout")
TabLayout.FillDirection = Enum.FillDirection.Horizontal
TabLayout.HorizontalAlignment = Enum.HorizontalAlignment.Center
TabLayout.Padding = UDim.new(0, 8)
TabLayout.Parent = TabContainer

local ContentContainer = Instance.new("Frame")
ContentContainer.Size = UDim2.new(1, -40, 1, -105)
ContentContainer.Position = UDim2.new(0, 20, 0, 100)
ContentContainer.BackgroundTransparency = 1
ContentContainer.Parent = MainFrame

local function createTab(name)
    local tab = Instance.new("TextButton")
    tab.Size = UDim2.new(0, 90, 1, 0)
    tab.BackgroundColor3 = Theme.Background
    tab.BackgroundTransparency = 1
    tab.Text = name
    tab.TextColor3 = Theme.SubText
    tab.Font = Enum.Font.GothamMedium
    tab.TextSize = 13
    tab.AutoButtonColor = false
    tab.Parent = TabContainer
    
    local corner = Instance.new("UICorner")
    corner.CornerRadius = UDim.new(0, 6)
    corner.Parent = tab
    
    return tab
end

local MainTab = createTab("Main")
local VisualsTab = createTab("Visuals")
local ChangelogTab = createTab("Log")
local CreditsTab = createTab("Credits")

local MainContent = Instance.new("Frame")
MainContent.Size = UDim2.new(1, 0, 1, 0)
MainContent.BackgroundTransparency = 1
MainContent.Parent = ContentContainer

local VisualsContent = Instance.new("Frame")
VisualsContent.Size = UDim2.new(1, 0, 1, 0)
VisualsContent.BackgroundTransparency = 1
VisualsContent.Visible = false
VisualsContent.Parent = ContentContainer

local ChangelogContent = Instance.new("Frame")
ChangelogContent.Size = UDim2.new(1, 0, 1, 0)
ChangelogContent.BackgroundTransparency = 1
ChangelogContent.Visible = false
ChangelogContent.Parent = ContentContainer

local CreditsContent = Instance.new("Frame")
CreditsContent.Size = UDim2.new(1, 0, 1, 0)
CreditsContent.BackgroundTransparency = 1
CreditsContent.Visible = false
CreditsContent.Parent = ContentContainer

local tabs = {MainTab, VisualsTab, ChangelogTab, CreditsTab}
local contents = {MainContent, VisualsContent, ChangelogContent, CreditsContent}
local activeIndex = 1
local isSwitching = false

local function switchTab(index)
    if isSwitching or activeIndex == index then return end
    isSwitching = true
    
    for i, t in pairs(tabs) do
        if i ~= index then
            TweenService:Create(t, TweenInfo.new(0.15, Enum.EasingStyle.Sine), {TextColor3 = Theme.SubText, BackgroundTransparency = 1}):Play()
        end
    end
    
    for i, c in pairs(contents) do
        if i ~= index then c.Visible = false end
    end
    
    activeIndex = index
    TweenService:Create(tabs[index], TweenInfo.new(0.15, Enum.EasingStyle.Sine), {TextColor3 = Theme.Text, BackgroundTransparency = 0.85}):Play()
    contents[index].Visible = true
    
    task.delay(0.15, function() isSwitching = false end)
end

MainTab.MouseButton1Click:Connect(function() switchTab(1) end)
VisualsTab.MouseButton1Click:Connect(function() switchTab(2) end)
ChangelogTab.MouseButton1Click:Connect(function() switchTab(3) end)
CreditsTab.MouseButton1Click:Connect(function() switchTab(4) end)

MainTab.TextColor3 = Theme.Text
MainTab.BackgroundTransparency = 0.85

-- // MAIN TAB CONTENT (With Game Info)
local WelcomeText = Instance.new("TextLabel")
WelcomeText.Size = UDim2.new(1, 0, 0, 30)
WelcomeText.BackgroundTransparency = 1
WelcomeText.Text = "Welcome to RGB SCRIPTS"
WelcomeText.TextColor3 = Theme.Text
WelcomeText.Font = Enum.Font.GothamBold
WelcomeText.TextSize = 20
WelcomeText.TextXAlignment = Enum.TextXAlignment.Left
WelcomeText.Parent = MainContent

local SubText = Instance.new("TextLabel")
SubText.Size = UDim2.new(1, 0, 0, 30)
SubText.Position = UDim2.new(0, 0, 0, 35)
SubText.BackgroundTransparency = 1
SubText.Text = "Plan: FREE | Select a tab above to explore."
SubText.TextColor3 = Theme.SubText
SubText.Font = Enum.Font.Gotham
SubText.TextSize = 14
SubText.TextXAlignment = Enum.TextXAlignment.Left
SubText.Parent = MainContent

-- Game Info Container
local GameInfoContainer = Instance.new("Frame")
GameInfoContainer.Size = UDim2.new(1, 0, 0, 70)
GameInfoContainer.Position = UDim2.new(0, 0, 0, 80)
GameInfoContainer.BackgroundColor3 = Theme.Background
GameInfoContainer.BackgroundTransparency = 0.8
GameInfoContainer.Parent = MainContent

local GameInfoCorner = Instance.new("UICorner")
GameInfoCorner.CornerRadius = UDim.new(0, 8)
GameInfoCorner.Parent = GameInfoContainer

local GameInfoStroke = Instance.new("UIStroke")
GameInfoStroke.Color = Theme.Stroke
GameInfoStroke.Transparency = 0.8
GameInfoStroke.Parent = GameInfoContainer

local GameIcon = Instance.new("ImageLabel")
GameIcon.Size = UDim2.new(0, 50, 0, 50)
GameIcon.Position = UDim2.new(0, 10, 0.5, -25)
GameIcon.BackgroundColor3 = Theme.Background
GameIcon.BackgroundTransparency = 0.5
GameIcon.Parent = GameInfoContainer

local GameIconCorner = Instance.new("UICorner")
GameIconCorner.CornerRadius = UDim.new(0, 6)
GameIconCorner.Parent = GameIcon

local GameName = Instance.new("TextLabel")
GameName.Size = UDim2.new(1, -80, 0, 20)
GameName.Position = UDim2.new(0, 70, 0, 15)
GameName.BackgroundTransparency = 1
GameName.Text = "Loading Game..."
GameName.TextColor3 = Theme.Text
GameName.Font = Enum.Font.GothamBold
GameName.TextSize = 16
GameName.TextXAlignment = Enum.TextXAlignment.Left
GameName.Parent = GameInfoContainer

local GameIdLabel = Instance.new("TextLabel")
GameIdLabel.Size = UDim2.new(1, -80, 0, 20)
GameIdLabel.Position = UDim2.new(0, 70, 0, 35)
GameIdLabel.BackgroundTransparency = 1
GameIdLabel.Text = "Game ID: " .. tostring(game.PlaceId)
GameIdLabel.TextColor3 = Theme.SubText
GameIdLabel.Font = Enum.Font.Gotham
GameIdLabel.TextSize = 13
GameIdLabel.TextXAlignment = Enum.TextXAlignment.Left
GameIdLabel.Parent = GameInfoContainer

-- Fetch Game Info
task.spawn(function()
    local success, gameInfo = pcall(function()
        return MarketplaceService:GetProductInfo(game.PlaceId)
    end)

    if success and gameInfo then
        GameName.Text = gameInfo.Name
        if gameInfo.IconImageAssetId and gameInfo.IconImageAssetId ~= 0 then
            GameIcon.Image = "rbxassetid://" .. gameInfo.IconImageAssetId
        else
            GameIcon.Image = "" 
        end
    else
        GameName.Text = "Unknown Game"
    end
end)

-- // VISUALS TAB CONTENT
local function createToggle(parent, name, yPos, isComingSoon)
    local btn = Instance.new("TextButton")
    btn.Size = UDim2.new(1, 0, 0, 38)
    btn.Position = UDim2.new(0, 0, 0, yPos)
    btn.BackgroundColor3 = Theme.Background
    btn.BackgroundTransparency = isComingSoon and 0.9 or 0.8
    btn.Text = isComingSoon and (name .. " (Locked)") or (name .. ": OFF")
    btn.TextColor3 = isComingSoon and Theme.SubText or Theme.Red
    btn.Font = Enum.Font.GothamMedium
    btn.TextSize = 14
    btn.AutoButtonColor = false
    btn.Parent = parent
    
    local corner = Instance.new("UICorner")
    corner.CornerRadius = UDim.new(0, 6)
    corner.Parent = btn
    
    local stroke = Instance.new("UIStroke")
    stroke.Color = Theme.Stroke
    stroke.Transparency = 0.8
    stroke.Parent = btn
    
    if not isComingSoon then
        btn.MouseEnter:Connect(function()
            TweenService:Create(btn, TweenInfo.new(0.15, Enum.EasingStyle.Sine), {BackgroundTransparency = 0.6}):Play()
        end)
        btn.MouseLeave:Connect(function()
            TweenService:Create(btn, TweenInfo.new(0.15, Enum.EasingStyle.Sine), {BackgroundTransparency = 0.8}):Play()
        end)
    end
    
    return btn
end

local BoxEspBtn = createToggle(VisualsContent, "Box ESP", 0, false)
local LineEspBtn = createToggle(VisualsContent, "Tracer Lines", 45, false)
local HealthEspBtn = createToggle(VisualsContent, "Health ESP", 90, false)
local FovBtn = createToggle(VisualsContent, "FOV Changer (PRO)", 135, true)
local FocBtn = createToggle(VisualsContent, "FOC Changer (PRO)", 180, true)
local AimbotBtn = createToggle(VisualsContent, "Aimbot (PRO)", 225, true)

-- // CHANGELOG TAB CONTENT
local ChangelogScrolling = Instance.new("ScrollingFrame")
ChangelogScrolling.Size = UDim2.new(1, 0, 1, 0)
ChangelogScrolling.BackgroundTransparency = 1
ChangelogScrolling.BorderSizePixel = 0
ChangelogScrolling.ScrollBarThickness = 3
ChangelogScrolling.ScrollBarImageColor3 = Theme.SubText
ChangelogScrolling.AutomaticCanvasSize = Enum.AutomaticSize.Y
ChangelogScrolling.CanvasSize = UDim2.new(0, 0, 0, 0)
ChangelogScrolling.Parent = ChangelogContent

local ChangelogText = Instance.new("TextLabel")
ChangelogText.Size = UDim2.new(1, -10, 0, 0)
ChangelogText.BackgroundTransparency = 1
ChangelogText.Text = [[v1.4.3 [BETA] - Game Info & ESP Hotfix
• Fixed: Box ESP lingering on screen when toggled off.
• Added: Game Info (Icon, Name, ID) to the Main tab.
• Optimized: Main tab layout.

v1.4.2 [BETA]
• Fixed: 'attempt to index nil with Visible' error.

v1.4.1 [BETA]
• Fixed: TextTransparency tween error.
• Improved: Premium Plan Selection UI.

v1.4.0 [BETA]
• Added: First-time Plan Selection menu.
• Optimized: ESP render loop (20 FPS cap).]]
ChangelogText.TextColor3 = Theme.SubText
ChangelogText.Font = Enum.Font.Gotham
ChangelogText.TextSize = 12
ChangelogText.TextXAlignment = Enum.TextXAlignment.Left
ChangelogText.TextYAlignment = Enum.TextYAlignment.Top
ChangelogText.AutomaticSize = Enum.AutomaticSize.Y
ChangelogText.Parent = ChangelogScrolling

-- // CREDITS TAB CONTENT
local CreditsTitle = Instance.new("TextLabel")
CreditsTitle.Size = UDim2.new(1, 0, 0, 30)
CreditsTitle.BackgroundTransparency = 1
CreditsTitle.Text = "Credits"
CreditsTitle.TextColor3 = Theme.Text
CreditsTitle.Font = Enum.Font.GothamBold
CreditsTitle.TextSize = 20
CreditsTitle.TextXAlignment = Enum.TextXAlignment.Left
CreditsTitle.Parent = CreditsContent

local CreditsInfo = Instance.new("TextLabel")
CreditsInfo.Size = UDim2.new(1, 0, 0, 100)
CreditsInfo.Position = UDim2.new(0, 0, 0, 40)
CreditsInfo.BackgroundTransparency = 1
CreditsInfo.Text = "AI Coding Platform:\\n" .. AI_PLATFORM .. "\\n\\nDevelopment Process Created By:\\n" .. DEVELOPER
CreditsInfo.TextColor3 = Theme.SubText
CreditsInfo.Font = Enum.Font.Gotham
CreditsInfo.TextSize = 13
CreditsInfo.TextXAlignment = Enum.TextXAlignment.Left
CreditsInfo.TextYAlignment = Enum.TextYAlignment.Top
CreditsInfo.Parent = CreditsContent

-- // ESP LOGIC
local Camera = Workspace.CurrentCamera
local espObjects = {}
local espEnabled = {Box = false, Lines = false, Health = false}
local drawingSupported = pcall(function() return Drawing.new("Square") end)
local lastEspUpdate = 0

local function createDrawing(type)
    if not drawingSupported then return nil end
    local obj = Drawing.new(type)
    obj.Visible = false
    obj.Thickness = 1
    obj.Color = Theme.Text
    return obj
end

local function setupPlayerDrawings(player)
    if player == Players.LocalPlayer or not drawingSupported then return end
    espObjects[player] = {
        Box = createDrawing("Square"),
        Line = createDrawing("Line"),
        HealthText = createDrawing("Text"),
        HealthBarBg = createDrawing("Square"),
        HealthBarFill = createDrawing("Square")
    }
    if espObjects[player].HealthText then
        espObjects[player].HealthText.Size = 12
        espObjects[player].HealthText.Center = true
        espObjects[player].HealthText.Outline = true
        espObjects[player].HealthText.OutlineColor = Theme.Background
        espObjects[player].HealthText.Font = 2
    end
end

if drawingSupported then
    for _, player in pairs(Players:GetPlayers()) do setupPlayerDrawings(player) end
    Players.PlayerAdded:Connect(setupPlayerDrawings)
    Players.PlayerRemoving:Connect(function(player)
        if espObjects[player] then
            for _, drawing in pairs(espObjects[player]) do
                if drawing then drawing:Remove() end
            end
            espObjects[player] = nil
        end
    end)
end

RunService.RenderStepped:Connect(function()
    if not drawingSupported or (not espEnabled.Box and not espEnabled.Lines and not espEnabled.Health) then return end
    
    local currentTime = tick()
    if currentTime - lastEspUpdate < 0.05 then return end 
    lastEspUpdate = currentTime
    
    for player, drawings in pairs(espObjects) do
        local character = player and player.Character
        local humanoid = character and character:FindFirstChildOfClass("Humanoid")
        local rootPart = character and character:FindFirstChild("HumanoidRootPart")
        
        if character and humanoid and rootPart and humanoid.Health > 0 then
            local hrpPos, onScreen = Camera:WorldToViewportPoint(rootPart.Position)
            
            if onScreen then
                local top = Camera:WorldToViewportPoint(rootPart.Position + Vector3.new(0, 3, 0))
                local bottom = Camera:WorldToViewportPoint(rootPart.Position - Vector3.new(0, 3, 0))
                local height = math.abs(top.Y - bottom.Y)
                local width = height / 2
                local boxPos = Vector2.new(hrpPos.X - width / 2, hrpPos.Y - height / 2)
                
                if espEnabled.Box and drawings.Box then
                    drawings.Box.Visible = true
                    drawings.Box.Size = Vector2.new(width, height)
                    drawings.Box.Position = boxPos
                elseif drawings.Box then
                    drawings.Box.Visible = false
                end
                
                if espEnabled.Lines and drawings.Line then
                    drawings.Line.Visible = true
                    drawings.Line.From = Vector2.new(Camera.ViewportSize.X / 2, Camera.ViewportSize.Y)
                    drawings.Line.To = Vector2.new(hrpPos.X, hrpPos.Y + height / 2)
                elseif drawings.Line then
                    drawings.Line.Visible = false
                end
                
                if espEnabled.Health and drawings.HealthText then
                    drawings.HealthText.Visible = true
                    drawings.HealthBarBg.Visible = true
                    drawings.HealthBarFill.Visible = true
                    
                    local healthPct = humanoid.Health / humanoid.MaxHealth
                    local barWidth = width
                    local barHeight = 3
                    local barPos = Vector2.new(boxPos.X, boxPos.Y - 8)
                    
                    drawings.HealthText.Text = string.format("%d%%", math.floor(healthPct * 100))
                    drawings.HealthText.Position = Vector2.new(hrpPos.X, boxPos.Y - 22)
                    drawings.HealthText.Color = Theme.Green:Lerp(Theme.Red, 1 - healthPct)
                    
                    drawings.HealthBarBg.Position = barPos
                    drawings.HealthBarBg.Size = Vector2.new(barWidth, barHeight)
                    drawings.HealthBarBg.Color = Theme.Background
                    drawings.HealthBarBg.Filled = true
                    
                    drawings.HealthBarFill.Position = barPos
                    drawings.HealthBarFill.Size = Vector2.new(barWidth * healthPct, barHeight)
                    drawings.HealthBarFill.Color = Theme.Green:Lerp(Theme.Red, 1 - healthPct)
                    drawings.HealthBarFill.Filled = true
                else
                    if drawings.HealthText then drawings.HealthText.Visible = false end
                    if drawings.HealthBarBg then drawings.HealthBarBg.Visible = false end
                    if drawings.HealthBarFill then drawings.HealthBarFill.Visible = false end
                end
            else
                for _, d in pairs(drawings) do if d then d.Visible = false end end
            end
        else
            for _, d in pairs(drawings) do if d then d.Visible = false end end
        end
    end
end)

-- Toggle Logic (Fixed lingering ESP bug)
local function toggleEspFeature(btn, featureKey, name)
    if not drawingSupported then
        btn.Text = name .. ": Not Supported"
        return
    end
    
    espEnabled[featureKey] = not espEnabled[featureKey]
    
    if espEnabled[featureKey] then
        btn.Text = name .. ": ON"
        TweenService:Create(btn, TweenInfo.new(0.15), {TextColor3 = Theme.Green}):Play()
    else
        btn.Text = name .. ": OFF"
        TweenService:Create(btn, TweenInfo.new(0.15), {TextColor3 = Theme.Red}):Play()
        
        -- FIX: Instantly hide the specific drawing when toggled off
        for _, drawings in pairs(espObjects) do
            if featureKey == "Box" and drawings.Box then
                drawings.Box.Visible = false
            elseif featureKey == "Lines" and drawings.Line then
                drawings.Line.Visible = false
            elseif featureKey == "Health" then
                if drawings.HealthText then drawings.HealthText.Visible = false end
                if drawings.HealthBarBg then drawings.HealthBarBg.Visible = false end
                if drawings.HealthBarFill then drawings.HealthBarFill.Visible = false end
            end
        end
    end
end

BoxEspBtn.MouseButton1Click:Connect(function() toggleEspFeature(BoxEspBtn, "Box", "Box ESP") end)
LineEspBtn.MouseButton1Click:Connect(function() toggleEspFeature(LineEspBtn, "Lines", "Tracer Lines") end)
HealthEspBtn.MouseButton1Click:Connect(function() toggleEspFeature(HealthEspBtn, "Health", "Health ESP") end)

-- WINDOW CONTROLS LOGIC
local isMinimized = false
local originalSize = MainFrame.Size

MinimizeBtn.MouseButton1Click:Connect(function()
    isMinimized = not isMinimized
    if isMinimized then
        TweenService:Create(MainFrame, TweenInfo.new(0.3, Enum.EasingStyle.Quart), {Size = UDim2.new(0, 520, 0, 50)}):Play()
        for _, v in pairs(MainFrame:GetChildren()) do
            if v:IsA("Frame") and v.Name ~= "Header" then v.Visible = false end
        end
    else
        TweenService:Create(MainFrame, TweenInfo.new(0.3, Enum.EasingStyle.Quart), {Size = originalSize}):Play()
        for _, v in pairs(MainFrame:GetChildren()) do
            if v:IsA("Frame") and v.Name ~= "Header" then v.Visible = true end
        end
    end
end)

CloseBtn.MouseButton1Click:Connect(function()
    for _, drawings in pairs(espObjects) do
        for _, drawing in pairs(drawings) do
            if drawing then drawing:Remove() end
        end
    end
    espObjects = {}
    
    local closeTween = TweenService:Create(MainFrame, TweenInfo.new(0.25, Enum.EasingStyle.Back, Enum.EasingDirection.In), {
        Size = UDim2.new(0, 0, 0, 0),
        BackgroundTransparency = 1
    })
    closeTween:Play()
    closeTween.Completed:Wait()
    
    ScreenGui:Destroy()
end)

-- DRAG SYSTEM
local dragging, dragInput, mousePos, framePos
Header.InputBegan:Connect(function(input)
    if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then
        dragging = true
        mousePos = input.Position
        framePos = MainFrame.Position
        
        input.Changed:Connect(function()
            if input.UserInputState == Enum.UserInputState.End then dragging = false end
        end)
    end
end)

Header.InputChanged:Connect(function(input)
    if input.UserInputType == Enum.UserInputType.MouseMovement or input.UserInputType == Enum.UserInputType.Touch then
        dragInput = input
    end
end)

UserInputService.InputChanged:Connect(function(input)
    if input == dragInput and dragging then
        local delta = input.Position - mousePos
        MainFrame.Position = UDim2.new(framePos.X.Scale, framePos.X.Offset + delta.X, framePos.Y.Scale, framePos.Y.Offset + delta.Y)
    end
end)`;
