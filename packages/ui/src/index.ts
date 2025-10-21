/**
 * iOS 26 Glassmorphism UI Component Library
 * Comprehensive Svelte 5 design system with glass morphism aesthetics
 */

// ==================== THEME SYSTEM ====================
export * from './theme'
export * from './theme/store'
export * from './theme/utils'

// ==================== DESIGN TOKENS ====================
export * from './tokens'

// ==================== FORM COMPONENTS ====================
import Button from './components/forms/Button.svelte'
import Input from './components/forms/Input.svelte'
import TextArea from './components/forms/TextArea.svelte'
import Select from './components/forms/Select.svelte'
import Checkbox from './components/forms/Checkbox.svelte'
import Radio from './components/forms/Radio.svelte'
import Switch from './components/forms/Switch.svelte'
import Slider from './components/forms/Slider.svelte'
import Stepper from './components/forms/Stepper.svelte'
import SearchInput from './components/forms/SearchInput.svelte'
import FileUploader from './components/forms/FileUploader.svelte'
import TagInput from './components/forms/TagInput.svelte'
import OTPInput from './components/forms/OTPInput.svelte'
import DatePicker from './components/forms/DatePicker.svelte'
import CreditCardInput from './components/forms/CreditCardInput.svelte'

export {
  Button,
  Input,
  TextArea,
  Select,
  Checkbox,
  Radio,
  Switch,
  Slider,
  Stepper,
  SearchInput,
  FileUploader,
  TagInput,
  OTPInput,
  DatePicker,
  CreditCardInput,
}

// ==================== LAYOUT COMPONENTS ====================
import Container from './components/layout/Container.svelte'
import Grid from './components/layout/Grid.svelte'
import Stack from './components/layout/Stack.svelte'
import Card from './components/layout/Card.svelte'
import Modal from './components/layout/Modal.svelte'
import Drawer from './components/layout/Drawer.svelte'
import BottomSheet from './components/layout/BottomSheet.svelte'
import AppShell from './components/layout/AppShell.svelte'
import Sidebar from './components/layout/Sidebar.svelte'
import Navbar from './components/layout/Navbar.svelte'
import Tooltip from './components/layout/Tooltip.svelte'
import Popover from './components/layout/Popover.svelte'
import Section from './components/layout/Section.svelte'

export {
  Container,
  Grid,
  Stack,
  Card,
  Modal,
  Drawer,
  BottomSheet,
  AppShell,
  Sidebar,
  Navbar,
  Tooltip,
  Popover,
  Section,
}

// ==================== FEEDBACK COMPONENTS ====================
import Alert from './components/feedback/Alert.svelte'
import Toast from './components/feedback/Toast.svelte'
import Badge from './components/feedback/Badge.svelte'
import Progress from './components/feedback/Progress.svelte'
import Spinner from './components/feedback/Spinner.svelte'
import Skeleton from './components/feedback/Skeleton.svelte'
import Dialog from './components/feedback/Dialog.svelte'
import EmptyState from './components/feedback/EmptyState.svelte'
import NotificationSystem from './components/feedback/NotificationSystem.svelte'
import ErrorBoundary from './components/feedback/ErrorBoundary.svelte'

export { Alert, Toast, Badge, Progress, Spinner, Skeleton, Dialog, EmptyState, NotificationSystem, ErrorBoundary }

// ==================== DATA DISPLAY COMPONENTS ====================
import Avatar from './components/data/Avatar.svelte'
import Tag from './components/data/Tag.svelte'
import List from './components/data/List.svelte'
import Table from './components/data/Table.svelte'
import Tabs from './components/data/Tabs.svelte'
import Accordion from './components/data/Accordion.svelte'
import Timeline from './components/data/Timeline.svelte'
import ActivityFeed from './components/data/ActivityFeed.svelte'
import MetricCard from './components/data/MetricCard.svelte'

export { Avatar, Tag, List, Table, Tabs, Accordion, Timeline, ActivityFeed, MetricCard }

// ==================== NAVIGATION COMPONENTS ====================
import Breadcrumbs from './components/navigation/Breadcrumbs.svelte'
import Pagination from './components/navigation/Pagination.svelte'
import Segments from './components/navigation/Segments.svelte'

export { Breadcrumbs, Pagination, Segments }

// ==================== MEDIA COMPONENTS ====================
import CameraCapture from './components/media/CameraCapture.svelte'
import BarcodeScanner from './components/media/BarcodeScanner.svelte'
import QRGenerator from './components/media/QRGenerator.svelte'
import ImageUploader from './components/media/ImageUploader.svelte'
import ImageCropper from './components/media/ImageCropper.svelte'
import MediaGallery from './components/media/MediaGallery.svelte'

export { CameraCapture, BarcodeScanner, QRGenerator, ImageUploader, ImageCropper, MediaGallery }

// ==================== AUDIO COMPONENTS ====================
import AudioPlayer from './components/audio/AudioPlayer.svelte'
import VoiceRecorder from './components/audio/VoiceRecorder.svelte'

export { AudioPlayer, VoiceRecorder }

// ==================== VIDEO COMPONENTS ====================
import VideoPlayer from './components/video/VideoPlayer.svelte'

export { VideoPlayer }

// ==================== CHAT COMPONENTS ====================
import ChatList from './components/chat/ChatList.svelte'
import MessageBubble from './components/chat/MessageBubble.svelte'
import MessageInput from './components/chat/MessageInput.svelte'
import TypingIndicator from './components/chat/TypingIndicator.svelte'
import ChatHeader from './components/chat/ChatHeader.svelte'

export { ChatList, MessageBubble, MessageInput, TypingIndicator, ChatHeader }

// ==================== VIDEO CHAT COMPONENTS ====================
import VideoRoom from './components/video-chat/VideoRoom.svelte'
import VideoTile from './components/video-chat/VideoTile.svelte'
import VideoControls from './components/video-chat/VideoControls.svelte'

export { VideoRoom, VideoTile, VideoControls }

// ==================== VOICE CHAT COMPONENTS ====================
import VoiceCall from './components/voice-chat/VoiceCall.svelte'

export { VoiceCall }

// ==================== UTILITY COMPONENTS ====================
import Backdrop from './components/utilities/Backdrop.svelte'
import Portal from './components/utilities/Portal.svelte'
import VisuallyHidden from './components/utilities/VisuallyHidden.svelte'

export { Backdrop, Portal, VisuallyHidden }

// ==================== BACKWARD COMPATIBILITY ====================
// Legacy components are re-exported from their new locations
import ThemeToggle from './components/ThemeToggle.svelte'
import Dropdown from './components/Dropdown.svelte'
import TemplateEditor from './components/TemplateEditor.svelte'
import TemplatePreview from './components/TemplatePreview.svelte'

export { ThemeToggle, Dropdown, TemplateEditor, TemplatePreview }

// ==================== COMPOSABLES (HOOKS) ====================
export * from './composables/useMediaQuery'
export * from './composables/useCamera'
export * from './composables/useMicrophone'
export * from './composables/useClickOutside'
export * from './composables/useIntersection'
export * from './composables/useFocusTrap'

// ==================== ANIMATIONS & TRANSITIONS ====================
export * from './animations/transitions'
export * from './animations/glassMorph'

// ==================== TYPES ====================
export * from './types'

// ==================== I18N ====================
export * from './i18n/hooks'
