import React, { useState } from "react"
import { Note, EntryCompletion, Tag } from "../Classes"
import { Client } from "../Client"
import "./Dashboard.css"


type DashboardParams = {
    notes: Note[],
    client: Client
}

type BarData = {
    label: string,
    count: number,
    colour: string
}



function DashboardBars({ data, total }: { data: BarData[], total: number }) {
    return (
        <div className="dashboard-bars">
            {data.map(item => (
                <div className="dashboard-bar-row" key={item.label}>
                    <div className="dashboard-bar-label">
                        <span>{item.label}</span>
                        <span className="dashboard-bar-label-sub">{item.count}</span>
                    </div>

                    <div className="dashboard-bar-track">
                        <div
                            className="dashboard-bar-fill"
                            style={{
                                width: `${total == 0 ? 0 : (item.count / total) * 100}%`,
                                backgroundColor: item.colour
                            }}
                        />
                    </div>
                </div>
            ))}
        </div>
    )
}




export function Dashboard({ notes, client }: DashboardParams) {
    const [tagMenuOpen, setTagMenuOpen] = useState(false)
    const [selectedTag, setSelectedTag] = useState<Tag | null>(null)

    const entries = notes.flatMap(note => note.entries)

    const totalEntries = entries.length



    const completionData: BarData[] = [
        {
            label: "Not Started",
            count: entries.filter(e => e.completion == EntryCompletion.NotStarted).length,
            colour: "#e45b65"
        },{
            label: "In Progress",
            count: entries.filter(e => e.completion == EntryCompletion.InProgress).length,
            colour: "#d9b65c"
        },{
            label: "Completed",
            count: entries.filter(e => e.completion == EntryCompletion.Completed).length,
            colour: "#65b98a"
        },{
            label: "Blocked",
            count: entries.filter(e => e.completion == EntryCompletion.Blocked).length,
            colour: "#a77be0"
        },
    ]




    const priorityData: BarData[] = [
        {
            label: "Low",
            count: entries.filter(e => e.priority == 0).length,
            colour: "#65b98a"
        },{
            label: "Medium",
            count: entries.filter(e => e.priority == 1).length,
            colour: "#d9b65c"
        },{
            label: "High",
            count: entries.filter(e => e.priority == 2).length,
            colour: "#e68b54"
        },{
            label: "Critical",
            count: entries.filter(e => e.priority == 3).length,
            colour: "#e45b65"
        },
    ]



    const containsTag = selectedTag == null ? 0 :
        entries.filter(entry => 
            entry.tags.some(tag => tag.tag_id == selectedTag.tag_id)
        ).length

    const doesNotContainTag = totalEntries - containsTag

    const tagData: BarData[] = [
        {
            label: "Contains Tag",
            count: containsTag,
            colour: "#65b98a"
        },{
            label: "Does Not Contain Tag",
            count: doesNotContainTag,
            colour: "#e45b65"
        },
    ]





    return (
        
        <div className="dashboard-graph-container">

            {/*Completion Graph*/}
            <div className="dashboard-graph">
                <div className="dashboard-graph-header">
                    <h2>Completion</h2>
                    <span>{totalEntries} total entries</span>
                </div>

                <div className="dashboard-graph-content">
                    <DashboardBars data={completionData} total={totalEntries}/>
                </div>
            </div>


            {/*Priority Graph*/}
            <div className="dashboard-graph">
                <div className="dashboard-graph-header">
                    <h2>Priority</h2>
                    <span>{totalEntries} total entries</span>
                </div>

                <div className="dashboard-graph-content">
                    <DashboardBars data={priorityData} total={totalEntries}/>
                </div>
            </div>




            {/*Tag Graph*/}
            <div className="dashboard-graph dashboard-tag-graph">
                <div className="dashboard-graph-header">
                    <h2>Tag</h2>
                    <span>Entries by tag</span>
                </div>

                <div className="dashboard-tag-selector">
                    <button
                        className="dashboard-tag-button"
                        onClick={() => setTagMenuOpen(!tagMenuOpen)}
                        onPointerDown={e => e.stopPropagation()}
                    >
                        {selectedTag ? selectedTag.name : "Select a tag"}
                        <span>{tagMenuOpen ? '⮝' : '⮟'}</span>
                    </button>

                    {tagMenuOpen && (
                        <div className="dashboard-tag-menu">
                            {client.tags.length == 0 ? (
                                <div className="dashboard-tag-empty">No tags available</div>
                                ) : (
                                    client.tags.map(tag => (
                                        <button
                                            key={tag.tag_id}
                                            className="dashboard-tag-option"
                                            onClick={() => {
                                                setSelectedTag(tag)
                                                setTagMenuOpen(false)
                                            }}
                                        >
                                            <span
                                                className="tag-circle"
                                                style={{
                                                    backgroundColor: tag.colour
                                                }}
                                            />
                                            {tag.name}

                                            {selectedTag?.tag_id == tag.tag_id && (
                                                <span className="dashboard-tag-selected">✓</span>
                                            )}

                                        </button>
                                    ))
                                )}
                        </div>
                    )}
                </div>

                <div className="dashboard-graph-content">

                    {selectedTag == null ? (
                        <div className="dashboard-tag-placeholder">
                            Select a tag to see its statistics.
                        </div>    
                    ) : (
                        <>
                            <div className="dashboard-selected-tag">
                                Showing stats for:
                                <span
                                    className="dashboard-selected-tag-name"
                                    style={{ color: selectedTag.colour }}
                                >
                                    {selectedTag.name}
                                </span>
                            </div>

                            <DashboardBars data={tagData} total={totalEntries}/>
                        </>
                    )}

                </div>
            </div>







        </div>
    )
}