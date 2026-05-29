extends Interactable

@export var item_id: String = ""
@export var dialogue_json_path: String = "res://data/dialogues/items.json"
@export var dialogue_id: String = ""
@export var flag_on_collect: String = ""

var _collected: bool = false


func _ready() -> void:
	super._ready()
	if item_id.is_empty():
		item_id = dialogue_id
	if GameState.has_item(item_id):
		_hide_collectible()


func _on_interact(_player: Node) -> void:
	if _collected:
		return
	var id := dialogue_id if not dialogue_id.is_empty() else item_id
	DialogueManager.start_from_json(id, dialogue_json_path, _on_dialogue_done)


func _on_dialogue_done() -> void:
	if _collected:
		return
	GameState.add_item(item_id)
	if not flag_on_collect.is_empty():
		GameState.set_flag(flag_on_collect, true)
	AudioManager.play_sfx("item_pickup")
	_hide_collectible()


func refresh_from_state() -> void:
	if GameState.has_item(item_id):
		_hide_collectible()


func _hide_collectible() -> void:
	_collected = true
	interaction_enabled = false
	if prompt_label:
		prompt_label.visible = false
	if visual:
		visual.visible = false
	set_deferred("monitoring", false)
