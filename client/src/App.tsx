import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import Workspace from "@/pages/Workspace";
import Chat from "@/pages/Chat";
import Developer from "@/pages/Developer";
import Files from "@/pages/Files";
import Admin from "@/pages/Admin";
import ImageGenerator from "@/pages/ImageGenerator";
import Usage from "@/pages/Usage";
import Datasets from "@/pages/Datasets";
import SignIn from "@/pages/SignIn";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
function Router() { return <Switch><Route path="/" component={Home} /><Route path="/signin" component={SignIn} /><Route path="/sign-in" component={SignIn} /><Route path="/login" component={SignIn} /><Route path="/app" component={Workspace} /><Route path="/app/chat" component={Chat} /><Route path="/app/files" component={Files} /><Route path="/app/generate/image" component={ImageGenerator} /><Route path="/app/usage" component={Usage} /><Route path="/app/datasets" component={Datasets} /><Route path="/app/api" component={Developer} /><Route path="/admin" component={Admin} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch>; }
export default function App() { return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>; }
