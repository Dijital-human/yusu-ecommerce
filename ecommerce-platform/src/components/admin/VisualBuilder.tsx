'use client';

import React, { useState, useRef } from 'react';
import { 
  Move, 
  Copy, 
  Trash2, 
  Settings, 
  Eye, 
  Save, 
  Undo, 
  Redo,
  Palette,
  Type,
  Image as ImageIcon,
  Layout,
  Layers
} from 'lucide-react';

// Component types / Komponent tipləri
interface ComponentConfig {
  id: string;
  type: 'text' | 'image' | 'button' | 'card' | 'grid' | 'container';
  name: string;
  icon: React.ReactNode;
  props: Record<string, any>;
  styles: Record<string, any>;
  children?: ComponentConfig[];
}

// Visual Builder komponenti / Visual Builder component
const VisualBuilder: React.FC = () => {
  // State / Vəziyyət
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [components, setComponents] = useState<ComponentConfig[]>([]);
  const [history, setHistory] = useState<ComponentConfig[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Refs / Reflər
  const canvasRef = useRef<HTMLDivElement>(null);

  // Available components / Mövcud komponentlər
  const availableComponents: ComponentConfig[] = [
    {
      id: 'text',
      type: 'text',
      name: 'Mətn / Text',
      icon: <Type size={20} />,
      props: {
        content: 'Mətn daxil edin / Enter text',
        fontSize: 16,
        fontWeight: 'normal',
        color: '#000000',
        textAlign: 'left',
      },
      styles: {
        fontSize: '16px',
        fontWeight: 'normal',
        color: '#000000',
        textAlign: 'left',
        padding: '8px',
        margin: '4px',
      },
    },
    {
      id: 'image',
      type: 'image',
      name: 'Şəkil / Image',
      icon: <ImageIcon size={20} />,
      props: {
        src: '/placeholder-image.jpg',
        alt: 'Şəkil / Image',
        width: 200,
        height: 200,
      },
      styles: {
        width: '200px',
        height: '200px',
        objectFit: 'cover',
        borderRadius: '8px',
        margin: '4px',
      },
    },
    {
      id: 'button',
      type: 'button',
      name: 'Düymə / Button',
      icon: <Settings size={20} />,
      props: {
        text: 'Düymə / Button',
        variant: 'primary',
        size: 'medium',
        onClick: 'console.log("Button clicked")',
      },
      styles: {
        backgroundColor: '#3b82f6',
        color: '#ffffff',
        padding: '8px 16px',
        borderRadius: '6px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '14px',
        margin: '4px',
      },
    },
    {
      id: 'card',
      type: 'card',
      name: 'Kart / Card',
      icon: <Layout size={20} />,
      props: {
        title: 'Kart başlığı / Card title',
        content: 'Kart məzmunu / Card content',
        image: '/placeholder-image.jpg',
        showImage: true,
        showTitle: true,
        showContent: true,
      },
      styles: {
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        padding: '16px',
        margin: '8px',
        width: '300px',
        minHeight: '200px',
      },
    },
    {
      id: 'grid',
      type: 'grid',
      name: 'Grid / Grid',
      icon: <Layers size={20} />,
      props: {
        columns: 3,
        gap: 16,
        responsive: true,
      },
      styles: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        padding: '8px',
      },
    },
  ];

  // Add component / Komponent əlavə et
  const addComponent = (componentType: string) => {
    const component = availableComponents.find(c => c.id === componentType);
    if (!component) return;

    const newComponent: ComponentConfig = {
      ...component,
      id: `${componentType}-${Date.now()}`,
    };

    setComponents(prev => [...prev, newComponent]);
    saveToHistory([...components, newComponent]);
  };

  // Update component / Komponenti yenilə
  const updateComponent = (id: string, updates: Partial<ComponentConfig>) => {
    const updatedComponents = components.map(comp =>
      comp.id === id ? { ...comp, ...updates } : comp
    );
    setComponents(updatedComponents);
    saveToHistory(updatedComponents);
  };

  // Delete component / Komponenti sil
  const deleteComponent = (id: string) => {
    const updatedComponents = components.filter(comp => comp.id !== id);
    setComponents(updatedComponents);
    saveToHistory(updatedComponents);
  };

  // Save to history / Tarixçəyə saxla
  const saveToHistory = (newComponents: ComponentConfig[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newComponents);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Undo / Geri al
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setComponents(history[historyIndex - 1]);
    }
  };

  // Redo / Təkrar et
  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setComponents(history[historyIndex + 1]);
    }
  };

  // Render component / Komponenti render et
  const renderComponent = (component: ComponentConfig) => {
    const isSelected = selectedComponent === component.id;
    
    switch (component.type) {
      case 'text':
        return (
          <div
            key={component.id}
            className={`relative ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setSelectedComponent(component.id)}
            style={component.styles}
          >
            {component.props.content}
          </div>
        );
      
      case 'image':
        return (
          <div
            key={component.id}
            className={`relative ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setSelectedComponent(component.id)}
          >
            <img
              src={component.props.src}
              alt={component.props.alt}
              style={component.styles}
            />
          </div>
        );
      
      case 'button':
        return (
          <button
            key={component.id}
            className={`relative ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setSelectedComponent(component.id)}
            style={component.styles}
          >
            {component.props.text}
          </button>
        );
      
      case 'card':
        return (
          <div
            key={component.id}
            className={`relative ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setSelectedComponent(component.id)}
            style={component.styles}
          >
            {component.props.showImage && (
              <img
                src={component.props.image}
                alt="Card image"
                className="w-full h-32 object-cover rounded-t-lg"
              />
            )}
            <div className="p-4">
              {component.props.showTitle && (
                <h3 className="text-lg font-semibold mb-2">
                  {component.props.title}
                </h3>
              )}
              {component.props.showContent && (
                <p className="text-gray-600">
                  {component.props.content}
                </p>
              )}
            </div>
          </div>
        );
      
      case 'grid':
        return (
          <div
            key={component.id}
            className={`relative ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setSelectedComponent(component.id)}
            style={component.styles}
          >
            <div className="grid grid-cols-3 gap-4 p-4 border-2 border-dashed border-gray-300">
              <div className="bg-gray-100 h-20 flex items-center justify-center text-gray-500">
                Grid Item 1
              </div>
              <div className="bg-gray-100 h-20 flex items-center justify-center text-gray-500">
                Grid Item 2
              </div>
              <div className="bg-gray-100 h-20 flex items-center justify-center text-gray-500">
                Grid Item 3
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar / Yan panel */}
      <div className="w-64 bg-white dark:bg-gray-800 shadow-lg flex flex-col">
        {/* Header / Başlıq */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Komponentlər / Components
          </h2>
        </div>

        {/* Components list / Komponentlər siyahısı */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {availableComponents.map(component => (
              <button
                key={component.id}
                onClick={() => addComponent(component.id)}
                className="w-full flex items-center space-x-3 p-3 text-left bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
              >
                {component.icon}
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {component.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content / Əsas məzmun */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar / Alət çubuğu */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={undo}
                disabled={historyIndex <= 0}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Undo size={20} />
              </button>
              <button
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Redo size={20} />
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className={`p-2 rounded-md transition-colors duration-200 ${
                  isPreviewMode
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Eye size={20} />
              </button>
              <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                <Save size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Canvas / Kanvas */}
        <div className="flex-1 overflow-auto p-4">
          <div
            ref={canvasRef}
            className="min-h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4"
          >
            {components.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <Layout size={48} className="mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">
                    Komponent əlavə edin / Add components
                  </p>
                  <p className="text-sm">
                    Sol paneldən komponentləri sürükləyib buraya atın / Drag components from left panel
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {components.map(component => renderComponent(component))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Properties panel / Xüsusiyyətlər paneli */}
      {selectedComponent && (
        <div className="w-80 bg-white dark:bg-gray-800 shadow-lg border-l border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Xüsusiyyətlər / Properties
            </h3>
          </div>
          
          <div className="p-4 space-y-4">
            {/* Component properties / Komponent xüsusiyyətləri */}
            {(() => {
              const component = components.find(c => c.id === selectedComponent);
              if (!component) return null;

              return (
                <div className="space-y-4">
                  {/* Basic properties / Əsas xüsusiyyətlər */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Ad / Name
                    </label>
                    <input
                      type="text"
                      value={component.name}
                      onChange={(e) => updateComponent(component.id, { name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  {/* Style properties / Stil xüsusiyyətləri */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Rəng / Color
                    </label>
                    <input
                      type="color"
                      value={component.styles.color || '#000000'}
                      onChange={(e) => updateComponent(component.id, {
                        styles: { ...component.styles, color: e.target.value }
                      })}
                      className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Font ölçüsü / Font size
                    </label>
                    <input
                      type="range"
                      min="12"
                      max="48"
                      value={parseInt(component.styles.fontSize) || 16}
                      onChange={(e) => updateComponent(component.id, {
                        styles: { ...component.styles, fontSize: `${e.target.value}px` }
                      })}
                      className="w-full"
                    />
                    <span className="text-sm text-gray-500">
                      {component.styles.fontSize || '16px'}
                    </span>
                  </div>

                  {/* Component-specific properties / Komponentə xas xüsusiyyətlər */}
                  {component.type === 'text' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Məzmun / Content
                      </label>
                      <textarea
                        value={component.props.content}
                        onChange={(e) => updateComponent(component.id, {
                          props: { ...component.props, content: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        rows={3}
                      />
                    </div>
                  )}

                  {component.type === 'image' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Şəkil URL / Image URL
                      </label>
                      <input
                        type="url"
                        value={component.props.src}
                        onChange={(e) => updateComponent(component.id, {
                          props: { ...component.props, src: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  )}

                  {/* Action buttons / Əməliyyat düymələri */}
                  <div className="flex space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => deleteComponent(component.id)}
                      className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors duration-200 flex items-center justify-center space-x-2"
                    >
                      <Trash2 size={16} />
                      <span>Sil / Delete</span>
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default VisualBuilder;
