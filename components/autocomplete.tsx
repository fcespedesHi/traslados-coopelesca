"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Check, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AutocompleteOption {
  value: string
  label: string
}

interface AutocompleteProps {
  options: AutocompleteOption[]
  placeholder?: string
  value?: string
  onValueChange?: (value: string) => void
  className?: string,
  not_found_message?: string
}

// Función para normalizar texto (eliminar tildes, comas, etc.)
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Eliminar diacríticos (tildes)
    .replace(/[.,;:!?]/g, "") // Eliminar puntuación
    .replace(/\s+/g, " ") // Normalizar espacios
    .trim()
}

export function Autocomplete({
  options,
  placeholder = "Seleccionar...",
  value = "",
  onValueChange,
  className,
  not_found_message
}: AutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [selectedValue, setSelectedValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Filter options based on input with normalized comparison
  const filteredOptions = options.filter((option) => {
    const normalizedInput = normalizeText(inputValue)
    const normalizedLabel = normalizeText(option.label)
    const normalizedValue = normalizeText(option.value)
    
    return normalizedLabel.includes(normalizedInput) || normalizedValue.includes(normalizedInput)
  })

  // Set initial display value
  useEffect(() => {
    const selectedOption = options.find((opt) => opt.value === selectedValue)
    if (selectedOption) {
      setInputValue(selectedOption.label)
    }
  }, [selectedValue, options])

  // Handle option selection
  const handleSelect = (option: AutocompleteOption) => {
    setSelectedValue(option.value)
    setInputValue(option.label)
    setIsOpen(false)
    onValueChange?.(option.value)
  }

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    setIsOpen(true)

    // If input is cleared, clear selection
    if (!newValue) {
      setSelectedValue("")
      onValueChange?.("")
    }
  }

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false)
        // Restore selected value if input doesn't match any option
        const selectedOption = options.find((opt) => opt.value === selectedValue)
        if (selectedOption) {
          setInputValue(selectedOption.label)
        } else if (!filteredOptions.some((opt) => opt.label === inputValue)) {
          setInputValue("")
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [selectedValue, options, inputValue, filteredOptions])

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="pr-10"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
          onClick={() => setIsOpen(!isOpen)}
        >
          <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
        </Button>
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <div
                key={option.value}
                className={cn(
                  "flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-50",
                  selectedValue === option.value && "bg-blue-50",
                )}
                onClick={() => handleSelect(option)}
              >
                <span className="text-sm">{option.label}</span>
                {selectedValue === option.value && <Check className="h-4 w-4 text-blue-600" />}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-gray-500">{not_found_message}</div>
          )}
        </div>
      )}
    </div>
  )
}
