
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building2, BookOpen, GraduationCap, Library, MoreVertical, Pencil, Trash2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SelectionTileProps {
    id: string;
    title: string;
    description?: string;
    type: 'faculty' | 'department' | 'degree' | 'module';
    onSelect: (id: string) => void;
    onEdit?: (id: string) => void;
    onDelete?: (id: string) => void;
}

export function SelectionTile({ id, title, description, type, onSelect, onEdit, onDelete }: SelectionTileProps) {
    const getIcon = () => {
        switch (type) {
            case 'faculty': return <Building2 className="h-8 w-8 mb-2 text-primary" />;
            case 'department': return <Library className="h-8 w-8 mb-2 text-primary" />;
            case 'degree': return <GraduationCap className="h-8 w-8 mb-2 text-primary" />;
            case 'module': return <BookOpen className="h-8 w-8 mb-2 text-primary" />;
            default: return <Building2 className="h-8 w-8 mb-2 text-primary" />;
        }
    }

    return (
        <Card className="hover:shadow-md transition-shadow cursor-default border-l-4 border-l-transparent hover:border-l-primary flex flex-col justify-between group">
            <CardHeader className="pb-2 relative">
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {(onEdit || onDelete) && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {onEdit && (
                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(id); }}>
                                        <Pencil className="mr-2 h-4 w-4" /> Edit
                                    </DropdownMenuItem>
                                )}
                                {onDelete && (
                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(id); }} className="text-destructive focus:text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
                <CardTitle className="flex justify-between items-start cursor-pointer" onClick={() => onSelect(id)}>
                    <div className="flex flex-col gap-1">
                        {getIcon()}
                        <span className="text-lg font-semibold line-clamp-2">{title}</span>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {description && <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{description}</p>}
                <Button variant="ghost" className="w-full justify-between group/btn p-0 hover:bg-transparent" onClick={() => onSelect(id)}>
                    Select <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
            </CardContent>
        </Card>
    );
}

interface SelectionGridProps {
    items: { _id: string, name: string, description?: string, [key: string]: any }[];
    type: 'faculty' | 'department' | 'degree' | 'module';
    onSelect: (id: string) => void;
    onEdit?: (id: string, item: any) => void;
    onDelete?: (id: string) => void;
    isLoading: boolean;
}

export function SelectionGrid({ items, type, onSelect, onEdit, onDelete, isLoading }: SelectionGridProps) {
    if (isLoading) {
        return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
                <div key={i} className="h-40 rounded-lg bg-muted animate-pulse"></div>
            ))}
        </div>
    }

    if (items.length === 0) {
        return <div className="text-center py-20 text-muted-foreground">No items found. Create one to get started.</div>
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(item => (
                <SelectionTile
                    key={item._id}
                    id={item._id}
                    title={item.name}
                    description={type === 'module' ? (item.code + ' - ' + item.semester) : item.description}
                    type={type}
                    onSelect={onSelect}
                    onEdit={onEdit ? (id) => onEdit(id, item) : undefined}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}

