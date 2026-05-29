extends Interactable

@export var dialogue_only: bool = false
@export var dialogue_json_path: String = "res://data/dialogues/items.json"
@export var dialogue_id: String = "drzwi"

var _weight_menu: Control = null


func _ready() -> void:
	super._ready()
	call_deferred("_find_weight_menu")


func _find_weight_menu() -> void:
	var root := get_tree().current_scene
	if root:
		_weight_menu = root.get_node_or_null("UI/WeightSelectMenu")


func _on_interact(_player: Node) -> void:
	if dialogue_only:
		DialogueManager.start_from_json(dialogue_id, dialogue_json_path)
		return
	if _weight_menu == null:
		_find_weight_menu()
	if _weight_menu and _weight_menu.has_method("open_menu"):
		_weight_menu.open_menu(self)
	else:
		push_warning("Bench: brak WeightSelectMenu")


func start_minigame(weight_kg: int) -> void:
	var root := get_tree().current_scene
	var minigame := root.get_node_or_null("UI/BenchMinigame") if root else null
	if minigame and minigame.has_method("start_lift"):
		DialogueManager.start_dynamic("Ty", ["Kładziesz się na ławkę...", "Gotowy? WAL!"], func():
			minigame.start_lift(weight_kg)
		)
	else:
		push_warning("Bench: brak BenchMinigame")
