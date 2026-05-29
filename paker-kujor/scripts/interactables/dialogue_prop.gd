extends Interactable

@export var dialogue_json_path: String = "res://data/dialogues/items.json"
@export var dialogue_id: String = ""
@export var toggles_music: bool = false
@export var collect_item_id: String = ""


func _on_interact(_player: Node) -> void:
	DialogueManager.start_from_json(dialogue_id, dialogue_json_path, _on_done)


func _on_done() -> void:
	if toggles_music:
		AudioManager.toggle_music()
	if not collect_item_id.is_empty() and not GameState.has_item(collect_item_id):
		GameState.add_item(collect_item_id)
		AudioManager.play_sfx("item_pickup")
