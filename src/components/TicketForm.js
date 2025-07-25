"use client";
import { useState } from "react";
import { useToast } from "@/context/ToastContext";
import { FaTicketAlt, FaEdit, FaList, FaFlag, FaUser, FaTags } from "react-icons/fa";
import FormInput from "@/components/FormInput";
import FormSelect from "@/components/FormSelect";
import FormTextarea from "@/components/FormTextarea";

export default function TicketForm({ onTicketCreated, onClose, riders = [] }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "general",
    priority: "medium",
    riderId: "",
    tags: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const submitData = {
        ...formData,
        riderId: formData.riderId || null,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
      };

      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Ticket created successfully!");
        if (onTicketCreated) {
          onTicketCreated(data.ticket);
        }
        if (onClose) {
          onClose();
        }
        // Reset form
        setFormData({
          title: "",
          description: "",
          category: "general",
          priority: "medium",
          riderId: "",
          tags: ""
        });
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to create ticket");
      }
    } catch (error) {
      console.error("Error creating ticket:", error);
      toast.error("Failed to create ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormInput
        type="text"
        name="title"
        value={formData.title}
        onChange={handleChange}
        placeholder="Enter ticket title *"
        required
        icon={<FaTicketAlt />}
      />

      <FormTextarea
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Describe the issue or request *"
        required
        rows={4}
        icon={<FaEdit />}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormSelect
          name="category"
          value={formData.category}
          onChange={handleChange}
          placeholder="Select Category"
          options={[
            { value: "general", label: "General" },
            { value: "technical", label: "Technical" },
            { value: "billing", label: "Billing" },
            { value: "maintenance", label: "Maintenance" },
            { value: "complaint", label: "Complaint" },
            { value: "suggestion", label: "Suggestion" }
          ]}
          icon={<FaList />}
        />

        <FormSelect
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          placeholder="Select Priority"
          options={[
            { value: "low", label: "Low" },
            { value: "medium", label: "Medium" },
            { value: "high", label: "High" },
            { value: "urgent", label: "Urgent" }
          ]}
          icon={<FaFlag />}
        />
      </div>

      {riders && riders.length > 0 && (
        <FormSelect
          name="riderId"
          value={formData.riderId}
          onChange={handleChange}
          placeholder="Assign to Rider (Optional)"
          options={riders.map(rider => ({
            value: rider._id,
            label: `${rider.name} - ${rider.email}`
          }))}
          icon={<FaUser />}
        />
      )}

      <FormInput
        type="text"
        name="tags"
        value={formData.tags}
        onChange={handleChange}
        placeholder="Tags (comma-separated, e.g., urgent, billing, refund)"
        icon={<FaTags />}
      />

      <div className="flex justify-end space-x-3">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? "Creating..." : "Create Ticket"}
        </button>
      </div>
    </form>
  );
}